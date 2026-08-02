import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/10 px-6 py-4 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden logo-glow shadow-lg shadow-blue-500/40 bg-gradient-to-br from-blue-500 to-purple-600 transition-transform group-hover:scale-110">
            <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight block leading-tight">TournaOps</span>
            <span className="text-[9px] text-blue-400 uppercase tracking-widest">Tournament OS</span>
          </div>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: January 2025</p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using TournaOps, you agree to be bound by these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Use of the Platform</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Use the platform for any illegal purpose</li>
              <li>Attempt unauthorized access</li>
              <li>Interfere with platform operation</li>
              <li>Impersonate any person</li>
              <li>Upload malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining account security. Notify us immediately of unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Tournament Data</h2>
            <p>You retain full ownership of your tournament data. You grant TournaOps a limited license to store and display this data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Free and Pro Plans</h2>
            <p className="mb-3">Key differences:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Free: Up to 3 tournaments, 64 squads max</li>
              <li>Pro: Unlimited tournaments, 400 squads, AI features</li>
              <li>Pro billed monthly, cancel anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Intellectual Property</h2>
            <p>The TournaOps platform is owned by TournaOps and protected by intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Disclaimers</h2>
            <p>TournaOps is provided as-is without warranties. We do not guarantee uninterrupted service availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact</h2>
            <p>Questions? <a href="mailto:legal@tournaops.com" className="text-blue-400 hover:text-blue-300">legal@tournaops.com</a></p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Back to Home</Link>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
}