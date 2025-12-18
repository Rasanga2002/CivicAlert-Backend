import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Setup transporter using env vars
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || undefined
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
export default sendEmail;
