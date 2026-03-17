const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    transporter = {
      sendMail: async (payload) => {
        console.log('[mail:mock]', JSON.stringify(payload));
        return { mocked: true };
      }
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter;
}

async function sendMail({ to, subject, html }) {
  const tx = getTransporter();
  await tx.sendMail({
    from: env.mailFrom,
    to,
    subject,
    html
  });
}

module.exports = {
  sendMail
};
