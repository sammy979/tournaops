"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Trophy,
  Clock,
  Info,
} from "lucide-react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TeamMember {
  id:   string;
  name: string;
  ign:  string;
  role: string;
}

type Step = 1 | 2 | 3;

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params?.slug as string;

  const [step,      setStep]      = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Team info
  const [teamName,    setTeamName]    = useState("");
  const [teamTag,     setTeamTag]     = useState("");
  const [captainName, setCaptainName] = useState("");
  const [email,       setEmail]       = useState("");
  const [region,      setRegion]      = useState("NA");

  // Step 2: Members
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "", ign: "", role: "IGL"      },
    { id: "2", name: "", ign: "", role: "Duelist"  },
    { id: "3", name: "", ign: "", role: "Initiator"},
    { id: "4", name: "", ign: "", role: "Sentinel" },
    { id: "5", name: "", ign: "", role: "Support"  },
  ]);

  // Step 3: Confirm
  const [agreed, setAgreed] = useState(false);

  const updateMember = (id: string, key: keyof TeamMember, val: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [key]: val } : m));

  const addMember = () => {
    if (members.length >= 7) return;
    setMembers(prev => [...prev, { id: Date.now().toString(), name: "", ign: "", role: "Sub" }]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 5) return;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060810] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">You're Registered!</h1>
          <p className="text-white/50 mb-2">
            <span className="text-white font-semibold">{teamName || "Your team"}</span> has been successfully registered for
          </p>
          <p className="text-violet-400 font-bold text-lg mb-6">Champions Circuit Season 4</p>
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">Check-In Reminder</p>
                <p className="text-white/40 text-xs">Remember to check in 15 minutes before your first match.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">Confirmation Email Sent</p>
                <p className="text-white/40 text-xs">Registration details sent to <span className="text-white/60">{email || "your email"}</span></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">Tournament Starts July 1</p>
                <p className="text-white/40 text-xs">Check the schedule for your match times.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/tournaments/${slug}`}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-center">
              View Tournament
            </Link>
            <Link href="/dashboard"
              className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 px-6 py-3 rounded-xl transition-colors text-center text-sm">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] bg-[#060810]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">
            Tourna<span className="text-violet-400">Ops</span>
          </button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button onClick={() => router.push(`/tournaments/${slug}`)} className="hover:text-white/70 transition-colors">Champions Circuit S4</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">Register</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Team Registration</h1>
          <p className="text-white/40">Champions Circuit Season 4 Â· Valorant Â· NA</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {[
            { n: 1, label: "Team Info" },
            { n: 2, label: "Roster" },
            { n: 3, label: "Confirm" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step > s.n  ? "bg-emerald-500 border-emerald-500 text-white" :
                  step === s.n? "bg-violet-600 border-violet-500 text-white" :
                  "bg-transparent border-white/[0.15] text-white/30"
                }`}>
                  {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-xs mt-1 font-medium ${step >= s.n ? "text-white/70" : "text-white/25"}`}>{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 mx-3 mb-4 ${step > s.n ? "bg-emerald-500/50" : "bg-white/[0.08]"}`} />}
            </div>
          ))}
        </div>

        {/* â”€â”€ Step 1: Team Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 1 && (
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">Team Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Team Name *</label>
                <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Team Alpha"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Team Tag * (3-5 chars)</label>
                <input value={teamTag} onChange={e => setTeamTag(e.target.value.toUpperCase().slice(0, 5))} placeholder="e.g. ALPH"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 font-mono uppercase" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Captain Name *</label>
                <input value={captainName} onChange={e => setCaptainName(e.target.value)} placeholder="Your name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="text-white/40 text-xs font-medium block mb-1.5">Contact Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="captain@email.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-white/40 text-xs font-medium block mb-1.5">Region</label>
                <div className="flex gap-2">
                  {["NA", "EU", "APAC", "LATAM"].map(r => (
                    <button key={r} onClick={() => setRegion(r)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${region === r ? "bg-violet-600 text-white" : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/70"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!teamName || !teamTag || !captainName || !email}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
                Next: Roster <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* â”€â”€ Step 2: Roster â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 2 && (
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Team Roster</h2>
                <p className="text-white/40 text-sm">Minimum 5, maximum 7 players</p>
              </div>
              <button onClick={addMember} disabled={members.length >= 7}
                className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] disabled:opacity-40 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Player
              </button>
            </div>

            <div className="space-y-3">
              {members.map((m, i) => (
                <div key={m.id} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-3 items-center bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                  <span className="text-white/20 text-sm font-bold w-5 text-center">{i + 1}</span>
                  <input value={m.name} onChange={e => updateMember(m.id, "name", e.target.value)} placeholder="Player name"
                    className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 min-w-0" />
                  <input value={m.ign} onChange={e => updateMember(m.id, "ign", e.target.value)} placeholder="IGN#0000"
                    className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 font-mono min-w-0" />
                  <select value={m.role} onChange={e => updateMember(m.id, "role", e.target.value)}
                    className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/40 min-w-0">
                    {["IGL", "Duelist", "Initiator", "Sentinel", "Support", "Sub"].map(r => (
                      <option key={r} value={r} className="bg-[#0f1117]">{r}</option>
                    ))}
                  </select>
                  <button onClick={() => removeMember(m.id)} disabled={members.length <= 5}
                    className="p-1.5 hover:bg-rose-500/10 disabled:opacity-20 disabled:cursor-not-allowed text-white/20 hover:text-rose-400 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="text-white/40 hover:text-white/70 text-sm transition-colors">â† Back</button>
              <button onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
                Next: Confirm <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* â”€â”€ Step 3: Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Confirm Registration</h2>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white/40 text-xs font-medium mb-2 uppercase tracking-wide">Team</p>
                  <p className="text-white font-bold text-lg">{teamName} <span className="text-white/30 font-mono text-sm">[{teamTag}]</span></p>
                  <p className="text-white/50 text-sm mt-1">{captainName} Â· {email}</p>
                  <p className="text-white/30 text-xs mt-1">{region} Region</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-white/40 text-xs font-medium mb-2 uppercase tracking-wide">Roster ({members.length} players)</p>
                  <div className="space-y-1">
                    {members.slice(0, 4).map(m => (
                      <div key={m.id} className="flex justify-between text-sm">
                        <span className="text-white/60 truncate">{m.name || "â€”"}</span>
                        <span className="text-white/30 text-xs">{m.role}</span>
                      </div>
                    ))}
                    {members.length > 4 && <p className="text-white/30 text-xs">+{members.length - 4} more</p>}
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200/70 text-sm leading-relaxed">
                    By registering, you confirm that all team members meet the eligibility requirements and agree to abide by the tournament rules.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${agreed ? "bg-violet-600 border-violet-500" : "border-white/20 bg-transparent"}`}>
                  {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="text-white/60 text-sm leading-relaxed">
                  I have read and agree to the <Link href={`/tournaments/${slug}`} className="text-violet-400 underline">tournament rules</Link> and confirm all submitted information is accurate.
                </span>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} className="text-white/40 hover:text-white/70 text-sm transition-colors">â† Back</button>
              <button onClick={handleSubmit} disabled={!agreed}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-base transition-colors">
                <Shield className="w-4 h-4" /> Submit Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}