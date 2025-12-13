import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const { name, email, subject, body } = await req.json();

    try {
        await resend.emails.send({
            from: 'Cleit <support@cleit.in>',
            to: email,
            subject: `We've received your message — Cleit Support`,
            html: `
            <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
                <div style="margin: auto; background-color: white; border-radius: 8px; padding: 20px; max-width: 600px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://res.cloudinary.com/dqwjvwb8z/image/upload/v1753870491/cleit_ay8dhd.png" 
                            alt="Cleit Logo" 
                            style="width: 150px; height: auto;">
                    </div>
                    
                    <h2 style="color: #333; text-align: center;">Hi ${name},</h2>
                    
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Thank you for reaching out to <strong>Cleit Support</strong>. 
                        We've received your message and will get back to you shortly.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <h3 style="color: #333;">Your Message</h3>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background-color: #f9f9f9; padding: 12px 16px; border-radius: 6px; font-size: 14px; color: #555; line-height: 1.6;">
                        ${body.replace(/\n/g, "<br>")}
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <p style="color: #555; font-size: 14px; line-height: 1.5;">
                        We’ll review your message and respond as soon as possible.
                    </p>
                    
                    <p style="color: #333; font-size: 14px; margin-top: 30px;">
                        Best regards,<br><strong>Team Cleit</strong>
                    </p>
                </div>
            </div>
            `,
        });

        await resend.emails.send({
            from: 'Cleit <support@cleit.in>',
            to: 'urvashis2407@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
            <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
                <div style="margin: auto; background-color: white; border-radius: 8px; padding: 20px; max-width: 600px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    
                    <h2 style="color: #333; margin-bottom: 20px;">📩 New Support Request</h2>
                    
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background-color: #f9f9f9; padding: 12px 16px; border-radius: 6px; font-size: 14px; color: #555; line-height: 1.6;">
                        ${body.replace(/\n/g, "<br>")}
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <p style="color: #999; font-size: 12px;">
                        This message was submitted via the Cleit support form.
                    </p>
                </div>
            </div>
            `,
        });

        return NextResponse.json(
            { message: 'Support message sent to user and admin' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send emails' },
            { status: 500 }
        );
    }
}
