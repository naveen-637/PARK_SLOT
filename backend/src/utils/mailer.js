import nodemailer from 'nodemailer';

const hasEmailConfig = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasEmailConfig()) {
    return { skipped: true, reason: 'Email credentials are not configured' };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });

  return { skipped: false, messageId: info.messageId };
};
