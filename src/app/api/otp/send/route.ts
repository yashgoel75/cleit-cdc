import redis from '@/lib/redis';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, {
        ex: 300,
    });

    try {
        const { data } = await resend.emails.send({
            from: "Cleit <noreply@cleit.in>",
            to: email,
            subject: "Welcome to Cleit - OTP Verification",
            html: `
            <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
                <div style="margin: auto; background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    
                    <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://res.cloudinary.com/dqwjvwb8z/image/upload/v1753870491/cleit_ay8dhd.png" 
                        alt="Cleit Logo" 
                        style="width: 150px; height: auto;">
                    </div>
                    
                    <h1 style="color: #333; text-align: center;">Welcome to Cleit!</h1>
                    
                    <p style="color: #555; font-size: 16px; text-align: left; line-height: 1.5;">
                    Thank you for registering with Cleit. Please use the OTP below to verify your email:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; background-color: #f0f4ff; color: #3b82f6; font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px 24px; border-radius: 6px;">
                        ${otp}
                    </span>
                    </div>
                    
                    <p style="color: #555; font-size: 14px; text-align: left;">
                    This OTP is valid for <strong>5 minutes</strong>.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; text-align: left; margin-top: 20px;">
                    If you did not request this, please ignore this email.
                    </p>
                    
                    <p style="color: #333; font-size: 14px; text-align: left; margin-top: 30px;">
                    Best regards,<br>Team Cleit
                    </p>
                    
                </div>
            </div>
`
            ,
        });

        return NextResponse.json(
            { message: "Email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}