import Link from "next/link";
import { Zap } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: January 2025</p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using TournaOps, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Use of the Platform</h2>
            <p className="mb-3">TournaOps grants you a limited, non-exclusive, non-transferable license to use the platform for lawful purposes. You agree not to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Interfere with or disrupt the platform&apos;s operation</li>
              <li>Impersonate any person or entity</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized use of your account. TournaOps is not liable for losses resulting from unauthorized account access due to your failure to secure your credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Tournament Data</h2>
            <p>You retain full ownership of tournament data you create on TournaOps. You grant TournaOps a limited license to store and display this data as necessary to provide the service. You are responsible for ensuring tournament data complies with applicable laws and does not infringe third-party rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Free and Pro Plans</h2>
            <p className="mb-3">TournaOps offers a free plan with limited features and a Pro plan with additional capabilities. Key differences:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Free: Up to 3 tournaments, 64 squads maximum</li>
              <li>Pro: Unlimited tournaments, up to 400 squads, AI features, Discord integration</li>
              <li>Pro subscriptions are billed monthly and can be cancelled at any time</li>
              <li>No refunds for partial months of Pro service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Intellectual Property</h2>
            <p>The TournaOps platform, including its design, code, features, and content (excluding user-generated content), is owned by TournaOps and protected by intellectual property laws. You may not copy, modify, or distribute any part of our platform without explicit written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Disclaimers</h2>
            <p>TournaOps is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted service availability. We are not responsible for data loss resulting from browser storage limitations or clearing.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>TournaOps shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid for the service in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time. Upon termination, your right to use the platform ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of TournaOps after changes constitutes acceptance of the new terms. We will provide notice of significant changes via email.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@tournaops.com" className="text-blue-400 hover:text-blue-300">legal@tournaops.com</a></p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">← Back to Home</Link>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  );
}