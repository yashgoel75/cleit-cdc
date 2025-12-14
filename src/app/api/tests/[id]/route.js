import { NextResponse } from "next/server";
import { Test, User } from "../../../../../db/schema";
import { register } from "@/instrumentation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";

export async function GET(_req, { params }) {
  await register();
  const authHeader = _req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paramsId = await params.id;
  const test = await Test.findById(paramsId);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
  return NextResponse.json({ test });
}

export async function PATCH(req, { params }) {
  const { id } = params;
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

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Fetch test
    const test = await Test.findById(id);
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Prevent duplicate application
    if (test.studentsApplied.includes(email)) {
      return NextResponse.json(
        { error: "Already applied for this test" },
        { status: 409 }
      );
    }

    // Fetch user
    const user = await User.findOne({ collegeEmail: email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent duplicate in user record
    const alreadyApplied = user.tests.some((t) => t.testId.toString() === id);
    if (alreadyApplied) {
      return NextResponse.json(
        { error: "Test already exists in user record" },
        { status: 409 }
      );
    }

    // Push application
    test.studentsApplied.push(email);
    user.tests.push({ testId: test._id, appliedAt: new Date() });

    await test.save();
    await user.save();

    return NextResponse.json({
      message: "Applied successfully",
      totalApplicants: test.studentsApplied.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  await register();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken || decodedToken.email !== email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const test = await Test.findByIdAndUpdate(
      id,
      { $pull: { studentsApplied: email } },
      { new: true, runValidators: true }
    );

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Remove from user
    const user = await User.findOne({ collegeEmail: email });
    if (user) {
      user.tests = user.tests.filter((t) => t.testId.toString() !== id);
      await user.save();
    }

    return NextResponse.json({
      message: "Withdrawn successfully",
      remainingApplicants: test.studentsApplied.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
