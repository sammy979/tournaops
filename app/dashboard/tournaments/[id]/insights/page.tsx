"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, RefreshCw, Copy, Check, Trophy, Target, Crown, TrendingUp, TrendingDown, Zap, Users, MessageSquare, Radio, Instagram } from "lucide-react";

type Insights = {
  summary?: string;
  mvp?: string;
  trends?: string;
  qualification?: string;
  social?: string;
  caster?: string;
};

type Stats = {
  totalTeams: number;
  totalMatches: number;
  totalKills: number;
  totalWWCD: number;
  avgKillsPerMatch: number;
  closestGap: number;
  leader?: { name: string; tag: string; points: number };
  topKiller?: { name: string; kills: number };
  topWWCD?: { name: string; wwcd: number };
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded"
    >
      {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

export default function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [insights, setInsights] = useState<Insights>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [lastGenerated, setLastGenerated] = useState<string>("");

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament));
  }, [id]);

  const generateInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tournaments/" + id + "/insights?type=all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setInsights(data.insights);
      setStats(data.stats);
      setLastGenerated(new Date().toLocaleString());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const trends = insights.trends ? (() => {
    try {
      const jsonMatch = insights.trends.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { return null; }
    return null;
  })() : null;

  const qualification = insights.qualification ? (() => {
    try {
      const jsonMatch = insights.qualification.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { return null; }
    return null;
  })() : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button onClick={() => router.push("/dashboard/tournaments/" + id)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Tournament
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <div className="absolute inset-0 blur-lg bg-purple-500/40 -z-10" />
              </div>
              AI Insights
            </h1>
            <p className="text-neutral-400 mt-1">
              {tournament?.name} · Powered by Groq Llama 3.3 70B
            </p>
          </div>

          <button
            onClick={generateInsights}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black px-6 py-3 rounded-xl text-sm disabled:opacity-50 shadow-lg shadow-purple-500/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing..." : (Object.keys(insights).length > 0 ? "Regenerate" : "Generate Insights")}
          </button>
        </div>

        {/* Info Banner */}
        {Object.keys(insights).length === 0 && !loading && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center mb-6">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h2 className="text-xl font-black text-white mb-2">AI-Powered Tournament Analysis</h2>
            <p className="text-neutral-300 text-sm mb-4">
              Get instant AI-generated insights from your tournament data — perfect for casters, social media, and analysis.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
              {[
                { icon: MessageSquare, label: "Match Summary" },
                { icon: Trophy, label: "MVP Prediction" },
                { icon: TrendingUp, label: "Hot & Cold Teams" },
                { icon: Target, label: "Qualification Odds" },
                { icon: Instagram, label: "Social Captions" },
                { icon: Radio, label: "Caster Notes" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="bg-neutral-900 rounded-lg p-3 border border-neutral-800 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-neutral-300">{f.label}</span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={generateInsights}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black px-8 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Generate All Insights
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 mb-6">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="bg-neutral-900 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <div className="text-white font-bold text-lg">AI is analyzing your tournament...</div>
            <div className="text-neutral-400 text-sm mt-1">Generating 6 different insights · Usually takes 15-30 seconds</div>
          </div>
        )}

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBox icon={Users} label="Teams" value={stats.totalTeams} color="#8b5cf6" />
            <StatBox icon={Zap} label="Matches" value={stats.totalMatches} color="#3b82f6" />
            <StatBox icon={Target} label="Total Kills" value={stats.totalKills} color="#ef4444" />
            <StatBox icon={Crown} label="WWCDs" value={stats.totalWWCD} color="#facc15" />
          </div>
        )}

        {/* INSIGHTS GRID */}
        {Object.keys(insights).length > 0 && (
          <div className="space-y-4">
            {lastGenerated && (
              <div className="text-xs text-neutral-500 text-right">
                Generated: {lastGenerated}
              </div>
            )}

            {/* Match Summary */}
            {insights.summary && (
              <InsightCard title="Match Summary" icon={MessageSquare} color="#3b82f6">
                <p className="text-neutral-200 leading-relaxed">{insights.summary}</p>
                <div className="mt-3"><CopyButton text={insights.summary} /></div>
              </InsightCard>
            )}

            {/* MVP Prediction */}
            {insights.mvp && (
              <InsightCard title="MVP Prediction" icon={Trophy} color="#facc15">
                <p className="text-neutral-200 leading-relaxed">{insights.mvp}</p>
                <div className="mt-3"><CopyButton text={insights.mvp} /></div>
              </InsightCard>
            )}

            {/* Trends */}
            {trends && (
              <InsightCard title="Hot & Cold Teams" icon={TrendingUp} color="#f97316">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-red-400" />
                      <span className="text-xs font-black text-red-400 tracking-widest">🔥 HOT</span>
                    </div>
                    <div className="text-white font-bold">{trends.hot?.team}</div>
                    <div className="text-neutral-400 text-sm mt-1">{trends.hot?.reason}</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-black text-blue-400 tracking-widest">❄️ COLD</span>
                    </div>
                    <div className="text-white font-bold">{trends.cold?.team}</div>
                    <div className="text-neutral-400 text-sm mt-1">{trends.cold?.reason}</div>
                  </div>
                </div>
              </InsightCard>
            )}

            {/* Qualification */}
            {qualification && Array.isArray(qualification) && (
              <InsightCard title="Qualification Probability" icon={Target} color="#10b981">
                <div className="space-y-2">
                  {qualification.map((q: any, i: number) => {
                    const prob = Number(q.probability) || 0;
                    const statusColor = prob >= 90 ? "text-green-400" : prob >= 70 ? "text-yellow-400" : prob >= 50 ? "text-orange-400" : "text-red-400";
                    const barColor = prob >= 90 ? "#10b981" : prob >= 70 ? "#facc15" : prob >= 50 ? "#f97316" : "#ef4444";
                    return (
                      <div key={i} className="bg-neutral-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-500 font-black text-sm">#{i + 1}</span>
                            <span className="text-white font-bold">{q.team}</span>
                            {q.status && <span className="text-xs bg-neutral-700 px-2 py-0.5 rounded text-neutral-300">{q.status}</span>}
                          </div>
                          <span className={"font-black text-lg " + statusColor}>{prob}%</span>
                        </div>
                        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <div style={{ width: prob + "%", background: barColor }} className="h-full transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </InsightCard>
            )}

            {/* Social Caption */}
            {insights.social && (
              <InsightCard title="Social Media Caption" icon={Instagram} color="#ec4899">
                <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700 font-mono text-sm text-neutral-200 whitespace-pre-wrap">
                  {insights.social}
                </div>
                <div className="mt-3"><CopyButton text={insights.social} /></div>
              </InsightCard>
            )}

            {/* Caster Notes */}
            {insights.caster && (
              <InsightCard title="Broadcast/Caster Notes" icon={Radio} color="#a855f7">
                <div className="whitespace-pre-wrap text-neutral-200 leading-relaxed">{insights.caster}</div>
                <div className="mt-3"><CopyButton text={insights.caster} /></div>
              </InsightCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{label}</div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function InsightCard({ title, icon: Icon, color, children }: any) {
  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800" style={{ borderTop: "3px solid " + color }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h3 className="text-lg font-black text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}