import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-950 text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                FairwayFit <span className="text-gold-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 max-w-xs">
              AI-powered golf club fitting for every golfer. Get fitted like a Tour pro without the fitting bay.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-white/40 hover:text-gold-400 transition-colors text-xs">Twitter</a>
              <a href="#" className="text-white/40 hover:text-gold-400 transition-colors text-xs">Instagram</a>
              <a href="#" className="text-white/40 hover:text-gold-400 transition-colors text-xs">LinkedIn</a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Start Fitting", href: "/fitting" },
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
                { label: "For Retailers", href: "/pricing#retailers" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} FairwayFit AI. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Powered by AI. Grounded in Data.
          </p>
        </div>
      </div>
    </footer>
  );
}
