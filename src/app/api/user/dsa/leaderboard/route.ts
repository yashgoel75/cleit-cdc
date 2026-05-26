import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../../../../db/schema";
import { register } from "@/instrumentation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";

export async function GET(req: NextRequest) {
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

    // Fetch all users who have opted into the leaderboard
    const users = await User.find(
      { participateLeaderboard: true },
      {
        name: 1,
        collegeEmail: 1,
        department: 1,
        batchStart: 1,
        batchEnd: 1,
        dsaProgress: 1,
      }
    );

    // Format the list and sort by solved questions count descending
    const leaderboard = users
      .map((u: any) => ({
        name: u.name || "Anonymous",
        collegeEmail: u.collegeEmail,
        department: u.department || "N/A",
        batchStart: u.batchStart,
        batchEnd: u.batchEnd,
        solvedCount: Array.isArray(u.dsaProgress) ? u.dsaProgress.length : 0,
      }))
      .sort((a: any, b: any) => b.solvedCount - a.solvedCount);

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (e) {
    console.error("Leaderboard GET error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
