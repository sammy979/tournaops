import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: January 2025</p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>TournaOps collects information you provide when creating an account, including your name, email, username, and password (hashed). Tournament data including team names, player info, and match results are stored in our secure PostgreSQL database.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Provide and maintain the TournaOps platform</li>
              <li>Enable multi-device sync</li>
              <li>Send important account updates</li>
              <li>Respond to support requests</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage</h2>
            <p>Your data is stored in a secure PostgreSQL database hosted on Railway. Passwords are hashed using bcrypt. We use industry-standard security practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
            <p>We use essential cookies for authentication (JWT session tokens). No advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
            <p>When you use Discord webhook integration, data is sent from your browser to Discord servers. We recommend reviewing Discord privacy policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Access your personal information</li>
              <li>Request correction of data</li>
              <li>Request deletion of your account</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact</h2>
            <p>For privacy questions: <a href="mailto:privacy@tournaops.com" className="text-blue-400 hover:text-blue-300">privacy@tournaops.com</a></p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Back to Home</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
}