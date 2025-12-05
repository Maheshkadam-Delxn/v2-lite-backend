import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const mailOptions = {
    from: `"SkyStruct" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email - SkyStruct",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fb;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              
              <!-- Main Container -->
              <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
                
                <!-- Header with Brand -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                      SkyStruct
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px; font-weight: 500;">
                      Construction Management System
                    </p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                      Verify Your Email Address
                    </h2>
                    <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                      Welcome to <strong>SkyStruct</strong>! We're excited to have you on board. To get started with managing your construction projects, please verify your email address by clicking the button below.
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" 
                            style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.3s ease;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Box -->
                    <table role="presentation" style="width: 100%; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; margin: 25px 0;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                            ⏱️ <strong style="color: #1e293b;">Important:</strong> This verification link will expire in <strong style="color: #2563eb;">1 hour</strong> for security purposes.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link -->
                    <p style="margin: 25px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0 0; word-break: break-all;">
                      <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none; font-size: 13px;">
                        ${verificationUrl}
                      </a>
                    </p>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="border-top: 1px solid #e2e8f0;"></div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px;">
                      Didn't create an account? You can safely ignore this email.
                    </p>
                    <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                      © ${new Date().getFullYear()} SkyStruct. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
              
              <!-- Footer Note -->
              <table role="presentation" style="width: 100%; max-width: 600px; margin-top: 20px;">
                <tr>
                  <td align="center" style="padding: 0 20px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                      This is an automated message, please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${to}`);
}