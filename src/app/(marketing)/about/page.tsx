import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Zap, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="gradient-hero py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="gold" className="mb-4">Our Mission</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Professional fitting for every golfer
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            We built FairwayFit AI because world-class equipment fitting shouldn't require a
            £500 appointment and a two-hour drive to a fitting centre.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The problem we're solving</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              The average golfer plays with equipment that doesn't fit them. Wrong shaft flex, incorrect
              loft, poor lie angle — these aren't small details. They cost you distance, accuracy, and
              more strokes than bad technique.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Professional fitting exists, but it's expensive, inaccessible, and often upsells you into
              equipment you don't need. We set out to democratise this. Using the same methodologies that
              Tour professionals rely on — adapted for real players at every level.
            </p>
          </div>
          <div className="bg-brand-900 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "80%", label: "of amateur golfers play misfit equipment" },
                { value: "12+", label: "strokes recovered with correct fitting" },
                { value: "6", label: "data-driven fitting steps" },
                { value: "94%", label: "of users report improved accuracy" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-gold-400">{value}</p>
                  <p className="text-sm text-white/60 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What we believe</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: "Data over opinion",
                description:
                  "Every recommendation is driven by your actual numbers — swing speed, attack angle, ball flight, distances. Not what the salesperson thinks looks good.",
              },
              {
                icon: Users,
                title: "Accessible to all",
                description:
                  "Whether you're a scratch player or a high handicapper picking up the game at 50, you deserve the same quality of fitting advice.",
              },
              {
                icon: Zap,
                title: "Transparent reasoning",
                description:
                  "We show you exactly why we're recommending each club. The science is exposed, not hidden behind a black box.",
              },
              {
                icon: Award,
                title: "Real-world outcomes",
                description:
                  "We measure success not by impressions or clicks, but by whether golfers hit the ball better after using our platform.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 shrink-0">
                  <Icon className="h-5 w-5 text-brand-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-brand-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try it free today</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            No credit card. No appointment. Just answer a few questions and get
            a professional-grade fitting report in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link href="/fitting">Get Your Free Fitting</Link>
            </Button>
            <Button variant="hero" size="lg" asChild>
              <Link href="/pricing">Retailer Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
