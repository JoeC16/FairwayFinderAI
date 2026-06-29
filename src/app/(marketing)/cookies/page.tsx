import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What are cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. We use
            them to keep you signed in and, with your consent, to track referrals so influencers and
            partners are credited when they introduce new customers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies we use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Name</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Purpose</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Type</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-gray-200 font-mono text-xs">next-auth.*</td>
                  <td className="p-3 border border-gray-200">Keeps you signed in to your account</td>
                  <td className="p-3 border border-gray-200">Essential</td>
                  <td className="p-3 border border-gray-200">Session / 30 days</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 border border-gray-200 font-mono text-xs">ff_consent</td>
                  <td className="p-3 border border-gray-200">Stores your cookie preference</td>
                  <td className="p-3 border border-gray-200">Essential</td>
                  <td className="p-3 border border-gray-200">1 year</td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200 font-mono text-xs">ff_ref</td>
                  <td className="p-3 border border-gray-200">
                    Records which referral partner introduced you so they receive their commission
                  </td>
                  <td className="p-3 border border-gray-200">Non-essential (tracking)</td>
                  <td className="p-3 border border-gray-200">30 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Essential cookies</h2>
          <p>
            The <code className="text-sm bg-gray-100 px-1 rounded">next-auth.*</code> session
            cookies and the <code className="text-sm bg-gray-100 px-1 rounded">ff_consent</code>{" "}
            preference cookie are strictly necessary for the site to function. They do not require
            your consent under UK GDPR.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Non-essential cookies</h2>
          <p>
            The <code className="text-sm bg-gray-100 px-1 rounded">ff_ref</code> referral cookie is
            only set if you click Accept in our cookie banner and arrive via a partner link
            containing a <code className="text-sm bg-gray-100 px-1 rounded">?ref=</code> parameter.
            If you decline, this cookie is never placed and referral attribution will not be
            recorded.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Managing your preferences</h2>
          <p>
            You can withdraw or change your cookie consent at any time by clearing your browser
            cookies for this site. On your next visit the cookie banner will reappear and you can
            make a new choice. Most browsers also let you block or delete cookies site-by-site in
            their privacy settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
          <p>
            If you have questions about our use of cookies, email us at{" "}
            <a href="mailto:privacy@fairwayfit.ai" className="text-brand-700 underline">
              privacy@fairwayfit.ai
            </a>{" "}
            or see our full{" "}
            <a href="/privacy" className="text-brand-700 underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
