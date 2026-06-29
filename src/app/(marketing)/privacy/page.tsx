import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: 29 June 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Who we are</h2>
          <p className="text-gray-600 leading-relaxed">
            FairwayFit AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the website fairwayfit.ai and provides AI-powered golf club fitting services. For the purposes of UK GDPR and the Data Protection Act 2018, we are the data controller of the personal data collected through this service.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            Contact: <a href="mailto:privacy@fairwayfit.ai" className="text-brand-700 underline">privacy@fairwayfit.ai</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. What data we collect</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li><strong>Account data:</strong> name, email address, password (hashed), and sign-in method (email/Google).</li>
            <li><strong>Fitting data:</strong> handicap, height, age, gender, playing frequency, club distances, swing tendency notes, and launch monitor data you submit during a fitting session.</li>
            <li><strong>Swing images:</strong> photos or screenshots you upload for swing analysis. These are processed by an AI model and are not stored long-term.</li>
            <li><strong>Payment data:</strong> processed by Stripe. We store only a Stripe customer ID — no raw card numbers are stored on our servers.</li>
            <li><strong>Usage data:</strong> pages visited, session duration, and basic analytics to improve the service.</li>
            <li><strong>Referral cookies:</strong> a short-term cookie (&ldquo;ff_ref&rdquo;) may be set when you arrive via a referral link to attribute your signup to a partner.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Why we collect it (legal basis)</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li><strong>Contract performance:</strong> fitting data, account data, and payment processing are necessary to provide the service you signed up for.</li>
            <li><strong>Legitimate interests:</strong> usage analytics and referral tracking to improve the product and measure marketing effectiveness.</li>
            <li><strong>Consent:</strong> marketing emails (you can opt out at any time).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. How we use your data</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>To generate your personalised club fitting recommendations.</li>
            <li>To send transactional emails (welcome, report ready, password reset).</li>
            <li>To process payments via Stripe.</li>
            <li>To improve our AI fitting engine and overall service.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Who we share data with</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li><strong>Anthropic:</strong> swing images are processed via Anthropic&apos;s Claude API. See <a href="https://www.anthropic.com/privacy" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">Anthropic&apos;s Privacy Policy</a>.</li>
            <li><strong>Stripe:</strong> payment processing. See <a href="https://stripe.com/gb/privacy" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a>.</li>
            <li><strong>Resend / SMTP provider:</strong> for transactional email delivery.</li>
            <li><strong>Retailer partners:</strong> if you complete a fitting via a golf retailer&apos;s embedded widget, your contact details and fitting summary are shared with that retailer as a lead.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">We do not sell your personal data to third parties.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Data retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your account and fitting data for as long as your account is active. You may request deletion at any time (see section 7). Payment records are retained for 7 years for legal compliance.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Your rights</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Under UK GDPR you have the right to:</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request erasure of your data.</li>
            <li>Object to or restrict processing.</li>
            <li>Data portability (receive your data in a machine-readable format).</li>
            <li>Lodge a complaint with the <a href="https://ico.org.uk" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">ICO</a>.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            To exercise any right, email <a href="mailto:privacy@fairwayfit.ai" className="text-brand-700 underline">privacy@fairwayfit.ai</a>. We will respond within 30 days.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            We use strictly necessary cookies for authentication (NextAuth session cookie) and optionally a referral cookie (&ldquo;ff_ref&rdquo;) set when you arrive via a partner link. No advertising cookies are set. See our <a href="/cookies" className="text-brand-700 underline">Cookie Policy</a> for details.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Changes to this policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this policy from time to time. Significant changes will be notified by email or a banner on the site.
          </p>
        </section>
      </div>
    </div>
  );
}
