import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = await verifyFirebaseToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { folder, public_id } = await req.json();

  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign: Record<string, string | number | undefined> = {
    timestamp,
    folder: folder || "resumes",
    public_id: public_id || undefined,
  };

  const signature = crypto
    .createHash("sha1")
    .update(
      Object.keys(paramsToSign)
        .filter((key) => paramsToSign[key] !== undefined)
        .sort()
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join("&") + process.env.CLOUDINARY_API_SECRET
    )
    .digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: folder || "resumes",
  });
}
