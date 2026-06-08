const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "FairwayFit AI";

const base = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <tr><td style="background:#166534;padding:28px 32px;text-align:center">
          <span style="color:#fbbf24;font-size:20px;font-weight:800">${APP_NAME}</span>
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (href: string, label: string, color = "#166534") =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px;margin:20px 0">${label}</a>`;

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827">${t}</h1>`;
const p = (t: string) => `<p style="margin:8px 0;font-size:15px;line-height:1.6;color:#374151">${t}</p>`;

export function welcomeEmail(name: string, role: "RETAILER" | "CONSUMER") {
  const isRetailer = role === "RETAILER";
  return base(`
    ${h1(`Welcome to ${APP_NAME}, ${name}!`)}
    ${p(isRetailer
      ? "Your retailer account is ready. Your 14-day free trial has started — no card needed yet."
      : "Your account is ready. Start your first AI-powered golf fitting for free.")}
    ${btn(isRetailer ? `${APP_URL}/retailer/dashboard` : `${APP_URL}/fitting/new`,
      isRetailer ? "Go to Your Dashboard" : "Start a Fitting")}
    ${p("If you have any questions, reply to this email and we'll help you out.")}
  `);
}

export function fittingCompleteEmail(name: string, sessionId: string) {
  return base(`
    ${h1("Your fitting report is ready!")}
    ${p(`Hi ${name}, your personalised club fitting is complete. Your AI-powered recommendations are waiting for you.`)}
    ${btn(`${APP_URL}/fitting/${sessionId}/results`, "View My Report", "#d97706")}
    ${p("You can also download a full PDF report from the results page.")}
  `);
}

export function passwordResetEmail(name: string, resetUrl: string) {
  return base(`
    ${h1("Reset your password")}
    ${p(`Hi ${name}, we received a request to reset your ${APP_NAME} password.`)}
    ${btn(resetUrl, "Reset Password")}
    ${p("This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.")}
  `);
}

export function trialExpiringEmail(name: string, daysLeft: number, upgradeUrl: string) {
  return base(`
    ${h1(`Your trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`)}
    ${p(`Hi ${name}, your free trial of ${APP_NAME} is ending soon. Upgrade now to keep your account active and retain all your fitting data.`)}
    ${btn(upgradeUrl, "Upgrade Now", "#d97706")}
    ${p("Questions about pricing? Just reply to this email.")}
  `);
}

export function subscriptionActiveEmail(name: string, plan: string) {
  return base(`
    ${h1("Subscription confirmed!")}
    ${p(`Hi ${name}, your <strong>${plan}</strong> subscription is now active. Thank you for choosing ${APP_NAME}.`)}
    ${btn(`${APP_URL}/retailer/dashboard`, "Go to Dashboard")}
  `);
}
