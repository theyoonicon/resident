import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@resident.app",
    to: email,
    subject: "[Resident] 로그인 인증코드",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">로그인 인증코드</h2>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6366f1; margin: 24px 0;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">5분 내에 입력해주세요.</p>
      </div>
    `,
  });
}
