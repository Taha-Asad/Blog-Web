const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const SendEmail = async (to, subject, templateName, data) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const tempPath = path.join(__dirname, "../views", `${templateName}.ejs`);
    const html = await ejs.renderFile(tempPath, data);
    const mailOptions = {
      from: `"Blog Website" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = SendEmail;