
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(
      getErrorHTML("Missing verification token"),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    return new NextResponse(
      getErrorHTML("Invalid or expired token"),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  return new NextResponse(getSuccessHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function getSuccessHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified Successfully</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f0f4f8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 16px;
          padding: 48px 32px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          text-align: center;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .checkmark-circle {
          width: 64px;
          height: 64px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .checkmark {
          width: 28px;
          height: 28px;
          border: 3px solid white;
          border-top: none;
          border-right: none;
          transform: rotate(-45deg);
        }
        
        h1 {
          font-size: 28px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        
        p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          transition: background 0.2s;
        }
        
        .button:hover {
          background: #2563eb;
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 40px 24px;
          }
          
          h1 {
            font-size: 26px;
          }
          
          p {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="checkmark-circle">
          <div class="checkmark"></div>
        </div>
        <h1>Email Verified!</h1>
        <p>Your email has been successfully verified. You can now access all features of your account.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || '/'}" class="button">Go to Dashboard</a>
      </div>
    </body>
    </html>
  `;
}

function getErrorHTML(message: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Failed</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f0f4f8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 16px;
          padding: 48px 32px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          text-align: center;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .error-circle {
          width: 64px;
          height: 64px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .error-x {
          width: 32px;
          height: 32px;
          position: relative;
        }
        
        .error-x::before,
        .error-x::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 32px;
          background: white;
          border-radius: 2px;
          top: 0;
          left: 14px;
        }
        
        .error-x::before {
          transform: rotate(45deg);
        }
        
        .error-x::after {
          transform: rotate(-45deg);
        }
        
        h1 {
          font-size: 28px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }
        
        p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        
        .button {
          display: inline-block;
          background: #ef4444;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          transition: background 0.2s;
        }
        
        .button:hover {
          background: #dc2626;
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 40px 24px;
          }
          
          h1 {
            font-size: 26px;
          }
          
          p {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-circle">
          <div class="error-x"></div>
        </div>
        <h1>Verification Failed</h1>
        <p>${message}. Please try again or contact support if the problem persists.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || '/'}" class="button">Back to Home</a>
      </div>
    </body>
    </html>
  `;
}