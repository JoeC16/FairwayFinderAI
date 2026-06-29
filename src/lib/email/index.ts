import nodemailer from "nodemailer";

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (transport) return transport;
  if (!process.env.SMTP_PASS) return null;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.resend.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER ?? "resend",
      pass: process.env.SMTP_PASS,
    },
  });
  return transport;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const t = getTransport();
  if (!t) {
    console.error(`[email] SMTP not configured — skipping email to ${to}: ${subject}`);
    return;
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM ?? "FairwayFit AI <hello@fairwayfit.ai>",
    to,
    subject,
    html,
  });
}
