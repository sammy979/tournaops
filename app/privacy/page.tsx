import Link from "next/link";
import { Zap } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TournaOps</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: January 2025</p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>TournaOps collects information you provide when creating an account, including your name, email address, and username. Tournament data including team names, player IGNs, match results, and standings are stored locally in your browser using localStorage. We do not collect or store this tournament data on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Provide and maintain the TournaOps platform</li>
              <li>Send important account and service updates</li>
              <li>Respond to support requests</li>
              <li>Improve platform features and performance</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage</h2>
            <p>Tournament data (teams, matches, results, standings) is stored entirely in your browser&apos;s localStorage. This means your data stays on your device and is not transmitted to or stored on TournaOps servers. Clearing your browser data will remove all tournament information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
            <p>We use essential cookies only — those required for authentication and basic platform functionality. We do not use advertising cookies or third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
            <p>TournaOps is hosted on Vercel. When you use Discord webhook integration, data is sent directly from your browser to Discord&apos;s servers. We recommend reviewing Discord&apos;s privacy policy for information on how they handle data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your account information. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your TournaOps account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your account information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>TournaOps is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact Us</h2>
            <p>For privacy-related questions or requests, contact us at <a href="mailto:privacy@tournaops.com" className="text-blue-400 hover:text-blue-300">privacy@tournaops.com</a></p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">← Back to Home</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
}