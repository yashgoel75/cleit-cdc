import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { register } from "@/instrumentation";
import { Webinar, User } from "../../../../../db/schema";

export async function GET(_req, { params }) {
  const { id } = params;
  await register();

  const authHeader = _req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid webinar ID" }, { status: 400 });
  }

  try {
    const webinar = await Webinar.findById(id).lean();
    if (!webinar) {
      return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
    }
    return NextResponse.json({ webinar });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { id } = params;
  await register();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid webinar ID" }, { status: 400 });
  }

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (decodedToken.email !== email) return NextResponse.json({ error: "Cannot register on behalf of another user" }, { status: 403 });

    const webinar = await Webinar.findById(id);
    if (!webinar) return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
    if (webinar.studentsApplied?.includes(email)) {
      return NextResponse.json({ error: "Already registered for this webinar" }, { status: 409 });
    }

    const user = await User.findOne({ collegeEmail: email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const alreadyRegistered = user.webinars.some((w) => w.webinarId.toString() === id);
    if (alreadyRegistered) return NextResponse.json({ error: "Webinar already exists in user record" }, { status: 409 });

    webinar.studentsApplied.push(email);
    user.webinars.push({ webinarId: webinar._id, appliedAt: new Date() });

    await webinar.save();
    await user.save();

    return NextResponse.json({
      message: "Successfully registered for webinar",
      registrantCount: webinar.studentsApplied.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const studentEmail = searchParams.get("email");

  await register();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken || decodedToken.email !== studentEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid webinar ID" }, { status: 400 });
  }

  try {
    const webinar = await Webinar.findByIdAndUpdate(
      id,
      { $pull: { studentsApplied: studentEmail } },
      { new: true, runValidators: true }
    );
    if (!webinar) return NextResponse.json({ error: "Webinar not found" }, { status: 404 });

    const user = await User.findOne({ collegeEmail: studentEmail });
    if (user) {
      user.webinars = user.webinars.filter((w) => w.webinarId.toString() !== id);
      await user.save();
    }

    return NextResponse.json({
      message: "Registration withdrawn successfully",
      remainingRegistrants: webinar.studentsApplied.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
