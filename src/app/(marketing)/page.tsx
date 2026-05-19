import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  BarChart3,
  Zap,
  Award,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Users,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative gradient-hero min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-950/50" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-gold-500/20 text-gold-300 border-gold-500/30 text-xs font-semibold px-3 py-1.5">
                AI-Powered Golf Fitting
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight text-balance">
                Get Fitted Like a{" "}
                <span className="text-gold-400">Tour Pro.</span>
              </h1>
              <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
                Professional-grade club fitting powered by AI. Input your swing data, distances, and tendencies — get precise equipment recommendations matched to your game.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="xl" variant="gold" asChild>
                  <Link href="/fitting">
                    Start Free Fitting
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="hero" asChild>
                  <Link href="/pricing#retailers">
                    Retailer Solutions
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-brand-800 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm mt-0.5">Trusted by 10,000+ golfers</p>
                </div>
              </div>
            </div>

            {/* Hero graphic */}
            <div className="hidden lg:block relative">
              <div className="relative glass rounded-3xl p-8 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">Your Fitting Report</h3>
                    <p className="text-white/60 text-sm">Based on TrackMan data</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gold-400 font-bold text-2xl">91%</span>
                    <span className="text-white/60 text-xs">Confidence</span>
                  </div>
                </div>

                {[
                  { club: "Driver", rec: "Ping G440 Max 10.5°", shaft: "Ventus Blue Stiff", conf: 91 },
                  { club: "Irons (5-PW)", rec: "TaylorMade P790", shaft: "KBS Tour Regular", conf: 87 },
                  { club: "Wedges", rec: "Vokey SM10 52/56/60°", shaft: "Dynamic Gold S400", conf: 84 },
                ].map((item) => (
                  <div key={item.club} className="glass-dark rounded-2xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{item.club}</p>
                        <p className="text-white font-semibold text-sm">{item.rec}</p>
                        <p className="text-white/60 text-xs mt-0.5">{item.shaft}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-brand-600/40 rounded-full px-2 py-0.5">
                          <span className="text-brand-300 text-xs font-semibold">{item.conf}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-500"
                        style={{ width: `${item.conf}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="glass-dark rounded-2xl p-4 mt-2">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Expected Benefits</p>
                  <div className="space-y-1.5">
                    {[
                      "+12y average driver distance",
                      "Slice corrected with draw-bias head",
                      "Better scoring zone gapping",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                        <span className="text-white/70 text-xs">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-brand-950 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { stat: "10,000+", label: "Fittings Completed" },
              { stat: "500+", label: "Retail Partners" },
              { stat: "91%", label: "Avg Confidence Score" },
              { stat: "4.9/5", label: "User Satisfaction" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold text-gold-400">{item.stat}</p>
                <p className="text-white/60 text-sm mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="brand" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold text-gray-900">
              Six Steps to Perfect Equipment
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Complete a structured fitting process and receive professional-grade recommendations in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Users,
                title: "Player Profile",
                desc: "Height, handicap, wrist-to-floor, playing frequency and goals.",
              },
              {
                step: "02",
                icon: Package,
                title: "Current Bag",
                desc: "Tell us what you're playing — driver, irons, wedges and shaft specs.",
              },
              {
                step: "03",
                icon: Target,
                title: "Shot Tendencies",
                desc: "Typical miss, strike pattern, ball flight and common frustrations.",
              },
              {
                step: "04",
                icon: BarChart3,
                title: "Distance Matrix",
                desc: "Carry distances for every club from driver through lob wedge.",
              },
              {
                step: "05",
                icon: Zap,
                title: "Launch Monitor Data",
                desc: "Optional TrackMan, GCQuad or SkyTrak data for maximum precision.",
              },
              {
                step: "06",
                icon: Award,
                title: "Your Fitting Report",
                desc: "AI-generated recommendations with confidence scores, product matches and PDF report.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative group">
                <div className="card-premium p-6 h-full hover:-translate-y-1 transition-transform duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 group-hover:bg-brand-100 transition-colors">
                        <Icon className="h-6 w-6 text-brand-700" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gold-600 tracking-wider">STEP {step}</span>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">{title}</h3>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/fitting">
                Begin Your Fitting
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="brand" className="mb-4">Fitting Engine</Badge>
            <h2 className="text-4xl font-bold text-gray-900">
              The Science Behind the Fitting
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: "Confidence Scoring",
                desc: "Every recommendation receives a confidence score (0-100%) based on the quality and quantity of data provided. More data = higher confidence = better recommendations.",
                highlights: ["Launch monitor: 30% weight", "Distance matrix: 20%", "Physical measurements: 15%"],
              },
              {
                icon: BarChart3,
                title: "Bag Gap Analysis",
                desc: "Analyse your complete distance matrix to identify missing windows, overlapping clubs and inefficient loft progressions across your entire set.",
                highlights: ["Visual gap charts", "Optimal 10-15y spacing", "Scoring zone analysis"],
              },
              {
                icon: Zap,
                title: "Launch Monitor Integration",
                desc: "Direct input from TrackMan, GCQuad, Flightscope and SkyTrak. Club speed, launch angle, spin rate and attack angle drive precise fitting decisions.",
                highlights: ["Driver loft optimisation", "Shaft flex from club speed", "Spin profile matching"],
              },
              {
                icon: ShoppingBag,
                title: "Inventory Matching",
                desc: "Recommendations matched directly to in-stock retailer inventory. Buy with confidence knowing the exact product is available.",
                highlights: ["Real-time stock checking", "Price comparison", "Direct purchase links"],
              },
            ].map(({ icon: Icon, title, desc, highlights }) => (
              <div key={title} className="card-premium p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-800 mb-6">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 mb-4 leading-relaxed">{desc}</p>
                <ul className="space-y-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-brand-600 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR RETAILERS */}
      <section className="py-24 gradient-hero" id="retailers">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-gold-500/20 text-gold-300 border-gold-500/30">For Retailers</Badge>
              <h2 className="text-4xl font-bold text-white">
                Convert More Visitors Into Buyers
              </h2>
              <p className="mt-6 text-lg text-white/70">
                Embed the FairwayFit AI fitting engine on your store or ecommerce site. Match fitting recommendations directly to your inventory. Capture qualified leads. Increase average order value.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Embeddable widget — one line of code",
                  "Full white-label with your branding",
                  "Inventory matching to your product catalogue",
                  "Lead capture and CRM integration",
                  "Conversion analytics dashboard",
                  "Custom domain support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex gap-4">
                <Button size="lg" variant="gold" asChild>
                  <Link href="/pricing#retailers">View Retailer Plans</Link>
                </Button>
                <Button size="lg" variant="hero" asChild>
                  <Link href="/auth/sign-up?role=retailer">Start Free Trial</Link>
                </Button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3 font-semibold">Embed Code</p>
              <div className="glass-dark rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
                <pre>{`<!-- Add to your website -->
<script
  src="https://fairwayfit.ai/widget.js"
  data-retailer="YOUR_ID"
></script>

<div id="fairwayfit-widget"></div>`}</pre>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { stat: "+32%", label: "Conversion lift" },
                  { stat: "-45%", label: "Return rate reduction" },
                  { stat: "+28%", label: "Average order value" },
                  { stat: "3x", label: "Lead generation" },
                ].map((item) => (
                  <div key={item.label} className="glass-dark rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gold-400">{item.stat}</p>
                    <p className="text-white/60 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-4xl font-bold text-gray-900">
            Ready to Find Your Perfect Equipment?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Start your free fitting in under 10 minutes. No booking required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button size="xl" asChild>
              <Link href="/fitting">
                Start Free Fitting
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
