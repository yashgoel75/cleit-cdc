import { NextResponse, NextRequest } from "next/server";
import { register } from "@/instrumentation";
import { Webinar } from "../../../../db/schema";
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
    const webinars = await Webinar.find().sort({ createdAt: -1 });
    return NextResponse.json({ webinars });
  } catch (error) {
    console.error("GET /api/webinar error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

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
    const { webinarIds } = body;

    if (!Array.isArray(webinarIds) || webinarIds.length === 0) {
      return NextResponse.json(
        { error: "webinarIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const validIds = webinarIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));

    const webinars = await Webinar.find({ _id: { $in: validIds } }).sort({ createdAt: -1 });

    return NextResponse.json({ webinars });
  } catch (error) {
    console.error("POST /api/webinars/details error:", error);
    return NextResponse.json({ error: "Failed to fetch webinar details" }, { status: 500 });
  }
}