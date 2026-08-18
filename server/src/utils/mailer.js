const nodemailer = require('nodemailer');
const { env } = require('../config/env');

function isMailConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

async function sendMail({ to, subject, html, text }) {
  if (!isMailConfigured()) {
    console.warn(`SMTP is not configured; email not sent (${subject} → ${to})`);
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
}

module.exports = { isMailConfigured, sendMail };
