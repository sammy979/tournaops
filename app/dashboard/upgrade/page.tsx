"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Trophy,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Crown,
  Sparkles,
  Users,
  Globe,
  BarChart2,
  Radio,
  Bot,
  Layers,
  CreditCard,
  Lock,
} from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    color: "border-white/[0.08]",
    header: "bg-white/[0.02]",
    icon: Shield,
    iconColor: "text-slate-400",
    current: true,
    features: [
      { text: "Up to 3 tournaments",          ok: true  },
      { text: "8 teams per tournament",        ok: true  },
      { text: "Basic brackets",                ok: true  },
      { text: "Public tournament page",        ok: true  },
      { text: "Discord notifications",         ok: true  },
      { text: "AI bracket generation",         ok: false },
      { text: "Broadcast control",             ok: false },
      { text: "Advanced analytics",            ok: false },
      { text: "Custom branding",               ok: false },
      { text: "Unlimited tournaments",         ok: false },
      { text: "Priority support",              ok: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 19.99, annual: 14.99 },
    color: "border-violet-500/50",
    header: "bg-gradient-to-br from-violet-600/20 to-indigo-600/20",
    icon: Star,
    iconColor: "text-violet-400",
    badge: "Most Popular",
    badgeColor: "bg-violet-600",
    current: false,
    features: [
      { text: "Unlimited tournaments",         ok: true  },
      { text: "Up to 64 teams",                ok: true  },
      { text: "All bracket formats",           ok: true  },
      { text: "Public tournament page",        ok: true  },
      { text: "Discord bot integration",       ok: true  },
      { text: "AI bracket generation",         ok: true  },
      { text: "Broadcast + OBS control",       ok: true  },
      { text: "Advanced analytics",            ok: true  },
      { text: "Custom branding & overlays",    ok: true  },
      { text: "Bulk team import",              ok: true  },
      { text: "Priority support",              ok: true  },
    ],
  },
  {
    name: "Pro+",
    price: { monthly: 49.99, annual: 37.99 },
    color: "border-amber-500/50",
    header: "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
    icon: Crown,
    iconColor: "text-amber-400",
    badge: "Enterprise",
    badgeColor: "bg-amber-600",
    current: false,
    features: [
      { text: "Everything in Pro",             ok: true  },
      { text: "Unlimited team size",           ok: true  },
      { text: "White-label solution",          ok: true  },
      { text: "Custom domain support",         ok: true  },
      { text: "Full API access",               ok: true  },
      { text: "Admin panel access",            ok: true  },
      { text: "SLA 99.9% uptime guarantee",    ok: true  },
      { text: "Dedicated account manager",     ok: true  },
      { text: "Custom integrations",           ok: true  },
      { text: "Invoice billing",               ok: true  },
      { text: "24/7 priority support",         ok: true  },
    ],
  },
];

const PRO_FEATURES = [
  { icon: Bot,      title: "AI Tools",           desc: "AI bracket generation, schedule optimization, and result prediction" },
  { icon: Radio,    title: "Broadcast Control",  desc: "OBS scene switcher, overlay management, stream monitoring"          },
  { icon: BarChart2,title: "Deep Analytics",     desc: "Win rates, map stats, team trends, and tournament insights"         },
  { icon: Globe,    title: "Custom Branding",    desc: "Custom colors, logos, fonts, and overlay themes"                    },
  { icon: Users,    title: "Bulk Operations",    desc: "Import teams from CSV, bulk messaging, and roster management"       },
  { icon: Layers,   title: "Multi-Stage Events", desc: "Group stages, playoffs, and grand finals in one tournament"         },
];

export default function UpgradePage() {
  const router  = useRouter();
  const [annual, setAnnual]   = useState(false);
  const [loading,setLoading]  = useState<string | null>(null);

  const handleUpgrade = (plan: string) => {
    setLoading(plan);
    setTimeout(() => {
      setLoading(null);
      router.push("/api/payments/checkout");
    }, 1500);
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Upgrade Your Plan
            </div>
            <h1 className="text-4xl font-black text-white mb-3">
              Take Your Tournaments{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Pro
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
              Unlock AI tools, broadcast control, advanced analytics, and unlimited tournaments.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1">
              <button onClick={() => setAnnual(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${!annual ? "bg-white/[0.08] text-white" : "text-slate-500"}`}>
                Monthly
              </button>
              <button onClick={() => setAnnual(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${annual ? "bg-violet-600 text-white" : "text-slate-500"}`}>
                Annual
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.5 rounded-full font-bold">Save 25%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {PLANS.map(plan => (
              <div key={plan.name} className={`border-2 rounded-2xl overflow-hidden relative transition-all hover:scale-[1.02] ${plan.color}`}>
                {plan.badge && (
                  <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </div>
                )}
                <div className={`p-6 ${plan.header}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center">
                      <plan.icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-white font-black text-xl">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">
                      {plan.price.monthly === 0 ? "Free" : `$${(annual ? plan.price.annual : plan.price.monthly).toFixed(2)}`}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-slate-500 text-sm">/ month</span>
                    )}
                  </div>
                  {annual && plan.price.monthly > 0 && (
                    <p className="text-emerald-400 text-xs mt-1">
                      Save ${((plan.price.monthly - plan.price.annual) * 12).toFixed(0)}/year
                    </p>
                  )}
                </div>

                <div className="p-5 bg-[#0a0c12]">
                  {plan.current ? (
                    <div className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-500 text-sm font-semibold text-center mb-5">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={loading === plan.name}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all mb-5 flex items-center justify-center gap-2 disabled:opacity-60 ${
                        plan.name === "Pro"  ? "bg-violet-600 hover:bg-violet-500 text-white hover:shadow-lg hover:shadow-violet-500/30" :
                        plan.name === "Pro+" ? "bg-amber-500 hover:bg-amber-400 text-black" :
                        "bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.12]"
                      }`}
                    >
                      {loading === plan.name ? (
                        <><CreditCard className="w-4 h-4 animate-pulse" /> Processing…</>
                      ) : plan.name === "Pro+" ? (
                        <>Contact Sales <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>Upgrade to {plan.name} <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                  <div className="space-y-2">
                    {plan.features.map(f => (
                      <div key={f.text} className={`flex items-center gap-2.5 ${!f.ok ? "opacity-30" : ""}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${f.ok ? "text-emerald-400" : "text-slate-700"}`} />
                        <span className={`text-sm ${f.ok ? "text-slate-300" : "text-slate-600 line-through"}`}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro feature highlights */}
          <div className="border-t border-white/[0.06] pt-10">
            <h2 className="text-white font-bold text-2xl text-center mb-2">What You Unlock with Pro</h2>
            <p className="text-slate-500 text-center mb-8">Professional tools used by top esports organizers worldwide</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRO_FEATURES.map(f => (
                <div key={f.title} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5 hover:border-violet-500/20 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-3">
                    <f.icon className="w-4.5 h-4.5 text-violet-400" />
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-10 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: Lock,    title: "Secure Payments",   desc: "Powered by Stripe. PCI-DSS compliant. Bank-level encryption."            },
                { icon: Trophy,  title: "14-Day Free Trial", desc: "Try Pro free for 14 days. Cancel anytime, no questions asked."           },
                { icon: Shield,  title: "Instant Access",    desc: "Upgrade activates immediately. All features unlocked right away."        },
              ].map(t => (
                <div key={t.title}>
                  <t.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm mb-1">{t.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}