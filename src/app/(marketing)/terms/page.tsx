import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: 29 June 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using FairwayFit AI (&ldquo;the Service&rdquo;) at fairwayfit.ai, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of service</h2>
          <p className="text-gray-600 leading-relaxed">
            FairwayFit AI provides AI-powered golf club fitting recommendations. The Service is for informational purposes only. Recommendations are generated algorithmically based on data you provide, and do not constitute professional advice. Equipment suitability may vary based on individual technique and conditions.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. User accounts</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>You must be at least 16 years old to create an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate information. Providing false data will produce incorrect recommendations.</li>
            <li>You may not share your account or use the Service for any unlawful purpose.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Payments and refunds</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            The one-time report unlock fee is charged by Stripe and is non-refundable once the report is delivered. Retailer subscription payments are billed monthly and governed by Stripe&apos;s terms. Subscriptions may be cancelled at any time; access continues until the end of the current billing period.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If you believe you were charged in error, contact <a href="mailto:support@fairwayfit.ai" className="text-brand-700 underline">support@fairwayfit.ai</a> within 14 days.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Intellectual property</h2>
          <p className="text-gray-600 leading-relaxed">
            All content, software, and trademarks on fairwayfit.ai are the property of FairwayFit AI or its licensors. You may not reproduce, distribute, or create derivative works without our express written permission. Your fitting data and uploaded images remain your property; you grant us a limited licence to process them to provide the Service.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Limitation of liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the fullest extent permitted by law, FairwayFit AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Governing law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms, contact <a href="mailto:legal@fairwayfit.ai" className="text-brand-700 underline">legal@fairwayfit.ai</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
