import { NextRequest, NextResponse } from "next/server";
import { register } from "@/instrumentation";
import { Test } from "../../../../db/schema";
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
    const tests = await Test.find().sort({ createdAt: -1 });
    return NextResponse.json({ tests });
  } catch (error) {
    console.error("GET /api/tests error:", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
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
    const { testIds } = body;

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return NextResponse.json(
        { error: "testIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const validIds = testIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));

    const tests = await Test.find({ _id: { $in: validIds } }).sort({ createdAt: -1 });

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("POST /api/tests/details error:", error);
    return NextResponse.json({ error: "Failed to fetch test details" }, { status: 500 });
  }
}