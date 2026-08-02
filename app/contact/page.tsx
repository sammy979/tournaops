"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, MessageSquare, Send, Check, Twitter, Globe } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSent(true);
      setSending(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/8 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden logo-glow shadow-lg shadow-blue-500/40 bg-gradient-to-br from-blue-500 to-purple-600">
            <img src="/logo.png" alt="TournaOps" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight block leading-tight">TournaOps</span>
            <span className="text-[9px] text-blue-400 uppercase tracking-widest">Tournament OS</span>
          </div>
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Have a question, feature request, or need help with your tournament? We respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {[
              {
                icon: Mail,
                title: "Email Support",
                desc: "For account and billing issues",
                value: "support@tournaops.com",
                href: "mailto:support@tournaops.com",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: MessageSquare,
                title: "Discord Community",
                desc: "Join tournament organizers",
                value: "discord.gg/tournaops",
                href: "https://discord.gg/tournaops",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
              },
              {
                icon: Twitter,
                title: "Twitter / X",
                desc: "Updates and announcements",
                value: "@tournaops",
                href: "https://twitter.com/tournaops",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                icon: Globe,
                title: "Live Platform",
                desc: "Try it free right now",
                value: "tournaops.com",
                href: "/register",
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
            ].map(c => {
              const Icon = c.icon;
              return (
                <a
                  key={c.title}
                  href={c.href}
                  className="flex items-start gap-4 p-4 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">{c.title}</p>
                    <p className="text-gray-600 text-xs mb-1">{c.desc}</p>
                    <p className={`text-sm ${c.color}`}>{c.value}</p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl border border-white/10 p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="btn-secondary px-6 py-2.5">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400 block mb-1.5">Your Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="input-field"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="input-field"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1.5">Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select a topic...</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Subscription</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Report a Bug</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-1.5">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="input-field resize-none"
                      placeholder="Tell us what you need help with..."
                      rows={6}
                      required
                    />
                  </div>

                  <button type="submit" disabled={sending} className="btn-primary w-full py-3">
                    {sending ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" />Send Message</>
                    )}
                  </button>

                  <p className="text-center text-gray-600 text-xs">
                    We typically respond within 24 hours on business days.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/8 py-8 px-6 mt-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-gray-600 text-sm">Â© 2025 TournaOps. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}