const nodemailer = require("nodemailer");

async function sendEmail(email, verificationCode) {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const secure = process.env.MAIL_SECURE === "true" || port === 465;
  const user = process.env.MAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.MAIL_PASS || process.env.EMAIL_PASS;
  const from = process.env.MAIL_FROM || user || "SwipeUp <noreply@swipeup.app>";

  if (!host || !user || !pass) {
    console.warn("Email config missing. Verification email was not sent.");
    return {
      ok: false,
      message: "Email configuration missing",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: "Verify your SwipeUp account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Welcome to SwipeUp</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 4px; color: #ff4458;">${verificationCode}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });

  console.log("✅ Email sent to:", email, "|", info.messageId);
  return {
    ok: true,
    messageId: info.messageId,
  };
}

module.exports = sendEmail;