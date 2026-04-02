import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../../../db/schema";
import { register } from "@/instrumentation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";

export async function POST(req: NextRequest) {
  try {
    await register();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { email, problemId, completed } = body;

    if (!email || !problemId || completed === undefined) {
      return NextResponse.json(
        { error: "Email, problemId, and completed status are required." },
        { status: 400 }
      );
    }

    let updatedUser;
    
    if (completed) {
      // Add problemId to array if it doesn't exist
      updatedUser = await User.findOneAndUpdate(
        { collegeEmail: email },
        { $addToSet: { dsaProgress: problemId } },
        { new: true }
      );
    } else {
      // Remove problemId from array
      updatedUser = await User.findOneAndUpdate(
        { collegeEmail: email },
        { $pull: { dsaProgress: problemId } },
        { new: true }
      );
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ dsaProgress: updatedUser.dsaProgress }, { status: 200 });
  } catch (e) {
    console.error("DSA Update error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
