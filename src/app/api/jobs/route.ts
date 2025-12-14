import { NextResponse, NextRequest } from "next/server";
import { register } from "@/instrumentation";
import { Job } from "../../../../db/schema";
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
    const jobs = await Job.find().sort({ createdAt: -1 });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
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
    const { jobIds } = body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: "jobIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const validIds = jobIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));

    const jobs = await Job.find({ _id: { $in: validIds } }).sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("POST /api/jobs/details error:", error);
    return NextResponse.json({ error: "Failed to fetch job details" }, { status: 500 });
  }
}