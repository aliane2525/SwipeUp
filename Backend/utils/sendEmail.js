const nodemailer = require("nodemailer");

async function sendEmail(email, verificationCode) {
  try {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT || 587);

    const secure =
      process.env.MAIL_SECURE === "true" ||
      port === 465;

    const user =
      process.env.MAIL_USER ||
      process.env.EMAIL_USER;

    const pass =
      process.env.MAIL_PASS ||
      process.env.EMAIL_PASS;

    const from =
      process.env.MAIL_FROM ||
      user;

    // ============================================
    // CHECK EMAIL CONFIGURATION
    // ============================================

    if (!host || !user || !pass || !from) {
      console.error(
        "❌ Email configuration is missing."
      );

      return {
        ok: false,
        message: "Email configuration missing",
      };
    }

    // ============================================
    // CREATE SMTP TRANSPORTER
    // ============================================

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    // ============================================
    // VERIFY SMTP CONNECTION
    // ============================================

    await transporter.verify();

    console.log("✅ SMTP connection ready");

    // ============================================
    // SEND EMAIL
    // ============================================

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your SwipeUp account",

      text: `Welcome to SwipeUp.

Your verification code is: ${verificationCode}

This code expires in 10 minutes.

If you did not create a SwipeUp account, you can ignore this email.`,

      html: `
        <!DOCTYPE html>
        <html>
          <body style="
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: Arial, sans-serif;
          ">

            <div style="
              max-width: 560px;
              margin: 40px auto;
              background: white;
              padding: 35px;
              border-radius: 16px;
              text-align: center;
            ">

              <h1 style="
                color: #ff4458;
                margin-bottom: 10px;
              ">
                SwipeUp
              </h1>

              <h2>
                Verify your email
              </h2>

              <p>
                Welcome to SwipeUp!
              </p>

              <p>
                Your verification code is:
              </p>

              <div style="
                margin: 25px 0;
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #ff4458;
              ">
                ${verificationCode}
              </div>

              <p>
                This code expires in
                <strong>10 minutes</strong>.
              </p>

              <p style="
                color: #777;
                font-size: 13px;
                margin-top: 30px;
              ">
                If you did not create a SwipeUp account,
                you can ignore this email.
              </p>

            </div>

          </body>
        </html>
      `,
    });

    console.log(
      "✅ Verification email sent to:",
      email
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    return {
      ok: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "❌ SEND EMAIL ERROR:",
      error.message
    );

    return {
      ok: false,
      message: error.message,
    };
  }
}

module.exports = sendEmail;