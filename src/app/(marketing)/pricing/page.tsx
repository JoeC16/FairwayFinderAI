import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: 49,
    description: "Perfect for single-location shops getting started with digital fitting.",
    icon: Zap,
    badge: null,
    features: [
      "Up to 50 fittings/month",
      "Embeddable fitting widget",
      "Lead capture & management",
      "CSV inventory import",
      "Email PDF reports to customers",
      "Basic analytics dashboard",
      "Standard widget branding",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up?role=retailer&plan=starter",
    variant: "outline" as const,
    highlight: false,
  },
  {
    name: "Professional",
    price: 149,
    description: "For growing retailers who want the full fitting experience.",
    icon: Building2,
    badge: "Most Popular",
    features: [
      "Up to 300 fittings/month",
      "Everything in Starter",
      "Custom branding & colors",
      "Advanced inventory matching",
      "AI-powered bag gap analysis",
      "Launch monitor data integration",
      "Full analytics & conversion tracking",
      "Priority email & chat support",
      "Custom domain widget",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up?role=retailer&plan=professional",
    variant: "gold" as const,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: 399,
    description: "Multi-location retailers and large chains with custom requirements.",
    icon: Crown,
    badge: null,
    features: [
      "Unlimited fittings",
      "Everything in Professional",
      "Multi-location management",
      "Custom AI model training",
      "White-label remove all branding",
      "Dedicated success manager",
      "SLA guarantee (99.9% uptime)",
      "Custom integrations & webhooks",
      "SSO / SAML authentication",
      "Quarterly business reviews",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@fairwayfit.ai",
    variant: "default" as const,
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="gradient-hero py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="gold" className="mb-4">Retailer Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start fitting your customers smarter
          </h1>
          <p className="text-xl text-white/70">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={cn(
                  "rounded-2xl border p-8 relative",
                  plan.highlight
                    ? "bg-brand-900 border-brand-800 shadow-2xl shadow-brand-900/30 scale-105"
                    : "bg-white border-gray-200"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gold" className="px-4 py-1 text-xs font-semibold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl mb-4",
                  plan.highlight ? "bg-gold-500" : "bg-brand-50"
                )}>
                  <Icon className={cn("h-6 w-6", plan.highlight ? "text-white" : "text-brand-700")} />
                </div>

                <h2 className={cn("text-2xl font-bold mb-1", plan.highlight ? "text-white" : "text-gray-900")}>
                  {plan.name}
                </h2>
                <p className={cn("text-sm mb-6", plan.highlight ? "text-white/60" : "text-gray-500")}>
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className={cn("text-5xl font-bold", plan.highlight ? "text-white" : "text-gray-900")}>
                    ${plan.price}
                  </span>
                  <span className={cn("text-sm ml-1", plan.highlight ? "text-white/50" : "text-gray-400")}>/month</span>
                </div>

                <Button variant={plan.variant} size="lg" className="w-full mb-8" asChild>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={cn("h-4 w-4 mt-0.5 shrink-0", plan.highlight ? "text-gold-400" : "text-brand-600")} />
                      <span className={cn("text-sm", plan.highlight ? "text-white/80" : "text-gray-600")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Consumer pricing */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">For Individual Golfers</h2>
            <p className="text-gray-500 mt-2">Run your fitting for free. Unlock the full report when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free Preview</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">£0</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Full AI fitting wizard",
                  "Overall confidence score",
                  "Shot tendency summary",
                  "Category fit indicators",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-brand-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/fitting/new">Start Free Fitting</Link>
              </Button>
            </div>

            {/* Unlock tier */}
            <div className="bg-brand-900 rounded-2xl border border-brand-800 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="gold" className="px-4 py-1 text-xs font-semibold">One-Time</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Full Report</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">£4.99</span>
                <span className="text-white/50 text-sm ml-1">per report</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Everything in Free Preview",
                  "Specific club & brand recommendations",
                  "Full specs: loft, flex, shaft weight",
                  "Bag gap analysis & chart",
                  "Upgrade priority order",
                  "Downloadable PDF report",
                  "10 fitting credits for future reports",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 text-gold-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="gold" size="lg" className="w-full" asChild>
                <Link href="/fitting/new">Start Fitting</Link>
              </Button>
              <p className="text-center text-white/40 text-xs mt-4">
                Payment required only after your analysis is complete
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h3>
          <div className="space-y-6">
            {[
              {
                q: "What counts as a 'fitting'?",
                a: "A fitting is one completed end-to-end session through the 6-step wizard. Incomplete or abandoned sessions don't count toward your limit.",
              },
              {
                q: "Can I upgrade or downgrade at any time?",
                a: "Yes. Plan changes take effect immediately. Upgrades are prorated; downgrades apply at the next billing cycle.",
              },
              {
                q: "What happens after my free trial ends?",
                a: "You'll be prompted to choose a paid plan. Your data is preserved for 30 days after trial expiry in case you decide to subscribe.",
              },
              {
                q: "Can golfers use my widget without creating an account?",
                a: "Yes. Golfers can complete a full fitting as guests. Their contact info is captured as a lead for your sales team. The £4.99 report unlock only applies to direct consumer fittings, not retailer-embedded widget fittings.",
              },
              {
                q: "Do you offer custom pricing for large groups?",
                a: "Yes — contact sales@fairwayfit.ai for custom Enterprise pricing including volume discounts and multi-year agreements.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h4 className="font-semibold text-gray-900 mb-1">{q}</h4>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
