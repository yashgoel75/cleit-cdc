import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { email, otp: inputOtp } = await req.json();

    if (!email || !inputOtp) {
      return NextResponse.json({ error: "Missing email or OTP" }, { status: 400 });
    }

    const storedOtp = await redis.get(`otp:${email}`);

    if (Number(storedOtp) === Number(inputOtp)) {
      await redis.del(`otp:${email}`);
      return NextResponse.json({ verified: true }, { status: 200 });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid request format", details: error }, { status: 500 });
  }
}