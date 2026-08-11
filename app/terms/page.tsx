"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SECTIONS = [
  { title: "Acceptance of Terms", content: "By accessing or using TournaOps, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform." },
  { title: "Use License", content: "Permission is granted to temporarily use TournaOps for personal, non-commercial transitory purposes. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose; attempt to decompile or reverse engineer any software contained on the platform; or remove any copyright or other proprietary notations from the materials." },
  { title: "Account Responsibilities", content: "You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account." },
  { title: "Tournament Rules", content: "All tournaments created on TournaOps must comply with our community guidelines. Organizers are responsible for enforcing their tournament rules fairly. TournaOps reserves the right to suspend or terminate tournaments that violate our policies, including tournaments promoting hate speech, cheating, or any form of discrimination." },
  { title: "Prize Pools and Payments", content: "TournaOps facilitates payment processing through Stripe. Organizers are solely responsible for distributing prize money to winners. TournaOps is not liable for any disputes between organizers and participants regarding prize distribution. All payments are subject to Stripe's terms of service." },
  { title: "Prohibited Activities", content: "You may not use TournaOps to: violate any laws or regulations; infringe upon intellectual property rights; distribute malware or harmful code; spam or harass other users; manipulate match results or engage in any form of cheating; create multiple accounts to circumvent bans or restrictions." },
  { title: "Intellectual Property", content: "The TournaOps platform, including its original content, features, and functionality, is and will remain the exclusive property of TournaOps and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of TournaOps." },
  { title: "Disclaimer", content: "The materials on TournaOps are provided on an 'as is' basis. TournaOps makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property." },
  { title: "Limitations", content: "In no event shall TournaOps or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TournaOps, even if TournaOps has been notified orally or in writing of the possibility of such damage." },
  { title: "Termination", content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately." },
  { title: "Governing Law", content: "These terms and conditions are governed by and construed in accordance with the laws of the State of California, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location." },
  { title: "Changes to Terms", content: "TournaOps reserves the right, at its sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms." },
];

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></button>
          <button onClick={() => router.push("/login")} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Sign In</button>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Effective date: January 1, 2025 · Last updated: July 1, 2025</p>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="border-l-2 border-indigo-500/30 pl-6">
              <h2 className="text-white font-bold text-lg mb-3">{i + 1}. {s.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-5 bg-[#0f1117] border border-white/[0.06] rounded-2xl">
          <p className="text-white/40 text-sm">Questions about our terms? <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">Contact us</Link> or email <span className="text-violet-400">legal@tournaops.com</span></p>
        </div>
      </div>
      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-violet-400">Ops</span></span>
          <div className="flex gap-4 text-white/30 text-sm">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}