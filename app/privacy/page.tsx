"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SECTIONS = [
  { title: "Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, create a tournament, or contact us for support. This includes your name, email address, and any other information you choose to provide. We also automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, operating system, referring URLs, and pages visited." },
  { title: "How We Use Your Information", content: "We use the information we collect to provide, maintain, and improve our services; process transactions; send you technical notices and support messages; respond to your comments and questions; and send you information about new features, products, and services offered by TournaOps (you may opt out at any time)." },
  { title: "Information Sharing", content: "We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share your information with trusted third parties who assist us in operating our platform, conducting our business, or servicing you, as long as those parties agree to keep this information confidential." },
  { title: "Data Security", content: "We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems and are required to keep the information confidential." },
  { title: "Cookies", content: "We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent." },
  { title: "Third-Party Services", content: "Our platform integrates with third-party services including Stripe for payment processing, Discord for notifications, and Google for authentication. These services have their own privacy policies governing the use of your information. We encourage you to review their privacy policies." },
  { title: "Data Retention", content: "We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at privacy@tournaops.com." },
  { title: "Children's Privacy", content: "Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us." },
  { title: "Changes to This Policy", content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date. You are advised to review this Privacy Policy periodically for any changes." },
  { title: "Contact Us", content: "If you have any questions about this Privacy Policy, please contact us at privacy@tournaops.com or by mail at TournaOps, 123 Esports Blvd, San Francisco, CA 94102." },
];

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></button>
          <button onClick={() => router.push("/login")} className="bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Sign In</button>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Effective date: January 1, 2025 Â· Last updated: July 1, 2025</p>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="border-l-2 border-yellow-500/30 pl-6">
              <h2 className="text-white font-bold text-lg mb-3">{i + 1}. {s.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-5 bg-[#0f1117] border border-white/[0.06] rounded-2xl">
          <p className="text-white/40 text-sm">Questions about our privacy practices? <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">Contact us</Link> or email <span className="text-violet-400">privacy@tournaops.com</span></p>
        </div>
      </div>
      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-violet-400">Ops</span></span>
          <div className="flex gap-4 text-white/30 text-sm">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}