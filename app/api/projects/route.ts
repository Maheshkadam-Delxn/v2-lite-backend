
// import dbConnect from "@/lib/dbConnect";
// import Project from "@/models/Project";
// import User from "@/models/User";
// import { NextResponse } from "next/server";
// import { getSession } from "@/lib/auth";
// import { canAccess } from "@/utils/permissions";
// import nodemailer from "nodemailer";
// import bcrypt from "bcryptjs";

// // Helper: generate random password
// const generatePassword = (length = 10) => {
//   const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
//   return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
// };

// // Helper: send email using Gmail with modern template
// async function sendClientEmail(toEmail: string, name: string, password: string) {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"Project Management System" <${process.env.SMTP_USER}>`,
//       to: toEmail,
//       subject: "Welcome to Your Project Portal - Account Created",
//       html: `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Welcome to Project Management System</title>
//         </head>
//         <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
//           <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
//             <tr>
//               <td style="padding: 40px 20px;">
//                 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

//                   <!-- Header -->
//                   <tr>
//                     <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
//                       <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
//                         Welcome Aboard!
//                       </h1>
//                     </td>
//                   </tr>

//                   <!-- Body -->
//                   <tr>
//                     <td style="padding: 40px;">
//                       <p style="margin: 0 0 24px; color: #1a202c; font-size: 16px; line-height: 1.6;">
//                         Hi <strong>${name}</strong>,
//                       </p>

//                       <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">
//                         Great news! A new project has been created for you in our Project Management System. Your dedicated client portal is now ready, giving you real-time access to project updates, milestones, and deliverables.
//                       </p>

//                       <!-- Credentials Card -->
//                       <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea; margin: 24px 0;">
//                         <tr>
//                           <td style="padding: 24px;">
//                             <p style="margin: 0 0 16px; color: #2d3748; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                               🔐 Your Login Credentials
//                             </p>

//                             <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
//                               <tr>
//                                 <td style="padding: 8px 0;">
//                                   <p style="margin: 0; color: #718096; font-size: 13px; font-weight: 500;">Email Address</p>
//                                   <p style="margin: 4px 0 0; color: #2d3748; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace;">${toEmail}</p>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td style="padding: 16px 0 8px;">
//                                   <p style="margin: 0; color: #718096; font-size: 13px; font-weight: 500;">Temporary Password</p>
//                                   <p style="margin: 4px 0 0; color: #2d3748; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${password}</p>
//                                 </td>
//                               </tr>
//                             </table>
//                           </td>
//                         </tr>
//                       </table>




//                       <!-- Security Notice -->
//                       <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffbeb; border-radius: 8px; border: 1px solid #fbbf24; margin: 24px 0;">
//                         <tr>
//                           <td style="padding: 16px;">
//                             <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
//                               <strong>⚠️ Security Reminder:</strong> Please change your password after your first login. Keep your credentials secure and never share them with anyone.
//                             </p>
//                           </td>
//                         </tr>
//                       </table>

//                       <p style="margin: 24px 0 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
//                         If you have any questions or need assistance, our team is here to help.
//                       </p>
//                     </td>
//                   </tr>

//                   <!-- Footer -->
//                   <tr>
//                     <td style="padding: 32px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
//                       <p style="margin: 0 0 8px; color: #2d3748; font-size: 14px; font-weight: 600;">
//                         Best regards,
//                       </p>
//                       <p style="margin: 0 0 16px; color: #4a5568; font-size: 14px;">
//                         Project Management Team
//                       </p>

//                       <p style="margin: 16px 0 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
//                         This is an automated message. Please do not reply to this email.
//                       </p>
//                     </td>
//                   </tr>

//                 </table>

//                 <!-- Footer Text -->
//                 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto 0;">
//                   <tr>
//                     <td style="text-align: center; padding: 0 20px;">
//                       <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
//                         © ${new Date().getFullYear()} Project Management System. All rights reserved.
//                       </p>
//                     </td>
//                   </tr>
//                 </table>

//               </td>
//             </tr>
//           </table>
//         </body>
//         </html>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent to ${toEmail}`);
//   } catch (error: any) {
//     console.error("❌ Error sending email:", error.message);
//   }
// }

// export async function POST(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session || !canAccess(session.role, ["admin", "manager"])) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//   }

//   try {
//     const body = await req.json();
//     console.log("Incoming body:", body);

//     if (!body.name || !body.projectType) {
//       return NextResponse.json(
//         { success: false, message: "Project name and type are required" },
//         { status: 400 }
//       );
//     }

//     const existing = await Project.findOne({ projectCode: body.projectCode });
//     if (existing) {
//       return NextResponse.json(
//         { success: false, message: "Project code already exists" },
//         { status: 400 }
//       );
//     }

//     // ✅ Step 1: Create or find client user
//     let clientUser = await User.findOne({ email: body.clientEmail });

//     if (!clientUser) {
//       const randomPassword = generatePassword();
//       const hashedPassword = await bcrypt.hash(randomPassword, 10);

//       clientUser = await User.create({
//         name: body.clientName,
//         email: body.clientEmail,
//         phone: body.clientPhone,
//         password: hashedPassword,
//         role: "client",
//       });

//       // ✅ Send email to client
//       await sendClientEmail(body.clientEmail, body.clientName, randomPassword);
//     }

//     // ✅ Step 2: Create project
//     const project = await Project.create({
//       ...body,
//       manager: session._id,
//       status: "ongoing",
//     });

//     const populated = await Project.findById(project._id).populate("manager engineers projectType");

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Project created successfully. Client account created and credentials emailed.",
//         data: populated,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.error("Error creating project:", error.message);
//     return NextResponse.json(
//       { success: false, message: "Server error while creating project" },
//       { status: 500 }
//     );
//   }
// }
// export async function GET(req: Request) {
//   await dbConnect();
//   const session = await getSession(req as any);

//   if (!session || !canAccess(session.role, ["admin", "manager"])) {
//     return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//   }

//   try {
//     const projects = await Project.find()
//       .populate("manager engineers projectType")
//       .sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, data: projects });
//   } catch (error: any) {
//     console.error("Error fetching projects:", error.message);
//     return NextResponse.json({ success: false, message: "Failed to load projects" }, { status: 500 });
//   }
// }

import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccess } from "@/utils/permissions";
import "@/models/ProjectType";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Helper: generate random password
const generatePassword = (length = 10) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};


async function sendClientEmail(toEmail: string, name: string, password: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Project Management System" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Welcome to Your Project Portal - Account Created",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Project Management System</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                        Welcome Aboard!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; color: #1a202c; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Great news! A new project has been created for you in our Project Management System. Your dedicated client portal is now ready, giving you real-time access to project updates, milestones, and deliverables.
                      </p>
                      
                      <!-- Credentials Card -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <p style="margin: 0 0 16px; color: #2d3748; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              🔐 Your Login Credentials
                            </p>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <p style="margin: 0; color: #718096; font-size: 13px; font-weight: 500;">Email Address</p>
                                  <p style="margin: 4px 0 0; color: #2d3748; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace;">${toEmail}</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0 8px;">
                                  <p style="margin: 0; color: #718096; font-size: 13px; font-weight: 500;">Temporary Password</p>
                                  <p style="margin: 4px 0 0; color: #2d3748; font-size: 15px; font-weight: 600; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${password}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                 
                     
                      
                      <!-- Security Notice -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffbeb; border-radius: 8px; border: 1px solid #fbbf24; margin: 24px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                              <strong>⚠️ Security Reminder:</strong> Please change your password after your first login. Keep your credentials secure and never share them with anyone.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                        If you have any questions or need assistance, our team is here to help.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 8px; color: #2d3748; font-size: 14px; font-weight: 600;">
                        Best regards,
                      </p>
                      <p style="margin: 0 0 16px; color: #4a5568; font-size: 14px;">
                        Project Management Team
                      </p>
                      
                      <p style="margin: 16px 0 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                        This is an automated message. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                  
                </table>
                
                <!-- Footer Text -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto 0;">
                  <tr>
                    <td style="text-align: center; padding: 0 20px;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.5;">
                        © ${new Date().getFullYear()} Project Management System. All rights reserved.
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
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);

  console.log("asdfe", session);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    console.log("Incoming body:", body);

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Project name and type are required" },
        { status: 400 }
      );
    }


    let clientUser = await User.findOne({ email: body.clientEmail });
    console.log("clientUser", clientUser);
    if (!clientUser) {
      const randomPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      clientUser = await User.create({
        name: body.clientName,
        email: body.clientEmail,
        phone: body.clientPhone,
        password: hashedPassword,
        isEmailVerified: true,
        newpassRequired: true,
        role: "client",
      });

      // 🚫 Do NOT send email if status is "Proposal Under Approval"
      if (body.status !== "Proposal Under Approval") {
        await sendClientEmail(body.clientEmail, body.clientName, randomPassword);
      } else {
        console.log("📭 Email skipped due to status: Proposal Under Approval");
      }
    }

    if (body.projectType == null) {
      body.needsNewSiteSurvey = true;
    }


    // ✅ Step 2: Create project
    const project = await Project.create({
      ...body,
      manager: session._id,
      createdBy: session._id,
      status: body.status || "ongoing",
    });

    const populated = await Project.findById(project._id).populate("manager engineers projectType");

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        data: populated,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating project:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error while creating project", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const session = await getSession(req as any);
  console.log("asdfasdfe", session);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized data" }, { status: 403 });
  }

  try {
    const projects = await Project.find()
      .populate("manager engineers projectType")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error("Error fetching projects:", error.message);
    return NextResponse.json({ success: false, message: "Failed to load projects" }, { status: 500 });
  }
}
