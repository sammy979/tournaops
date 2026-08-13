"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2, Trophy, Users, Shield, Zap } from "lucide-react";

const TOPICS = ["General Inquiry","Technical Support","Billing & Payments","Partnership / Sponsorship","Feature Request","Report a Bug","Other"];

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:"", email:"", topic: TOPICS[0], message:"" });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const upd = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></button>
          <button onClick={() => router.push("/login")} className="bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Sign In</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Get in Touch</h1>
          <p className="text-white/40 text-lg">We typically respond within 24 hours</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: MessageSquare, title: "General Support",    desc: "Questions about features, tournaments, or your account",  contact: "support@tournaops.com"     },
              { icon: Shield,        title: "Billing & Payments", desc: "Invoice requests, refunds, and subscription management",  contact: "billing@tournaops.com"     },
              { icon: Users,         title: "Partnerships",       desc: "Sponsorship opportunities and business development",      contact: "partners@tournaops.com"    },
              { icon: Zap,           title: "Technical Issues",   desc: "Bug reports, API questions, and integration support",     contact: "tech@tournaops.com"        },
            ].map(item => (
              <div key={item.title} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    <p className="text-violet-400 text-xs mt-1.5">{item.contact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-[#0f1117] border border-emerald-500/20 rounded-2xl p-12 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-white font-bold text-xl mb-2">Message Sent!</h2>
                <p className="text-white/40 mb-6">We'll get back to you at <span className="text-white/60">{form.email}</span> within 24 hours.</p>
                <button onClick={() => setSent(false)} className="bg-yellow-500 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">Send Another</button>
              </div>
            ) : (
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-5">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-xs font-medium block mb-1.5">Your Name</label>
                      <input value={form.name} onChange={e => upd("name",e.target.value)} placeholder="Full name"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-500/50" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-medium block mb-1.5">Email Address</label>
                      <input type="email" value={form.email} onChange={e => upd("email",e.target.value)} placeholder="you@email.com"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-medium block mb-1.5">Topic</label>
                    <select value={form.topic} onChange={e => upd("topic",e.target.value)}
                      className="w-full bg-[#0f1117] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                      {TOPICS.map(t => <option key={t} value={t} className="bg-[#0f1117]">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-medium block mb-1.5">Message</label>
                    <textarea value={form.message} onChange={e => upd("message",e.target.value)} rows={5} placeholder="Describe your question or issue in detailâ€¦"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-yellow-500/50 resize-none" />
                  </div>
                  <button type="submit" disabled={loading || !form.name || !form.email || !form.message}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-500 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sendingâ€¦</> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-violet-400">Ops</span></span>
          <p className="text-white/20 text-sm">Â© 2025 TournaOps. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}