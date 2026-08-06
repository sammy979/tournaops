"use client";
import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { Download, ArrowLeft, Loader2 } from "lucide-react";

type Team = { id: string; name: string; tag?: string; logo?: string };
type Match = { id: string; results?: any };
type Tournament = {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  scoringRule?: any;
  bannerImage?: string;
  brandingData?: any;
};

type Standing = {
  team: Team;
  totalPoints: number;
  kills: number;
  wwcd: number;
  matchesPlayed: number;
  bestPlacement: number;
};

const PLACEMENT_POINTS: Record<number, number> = {
  1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1,
};

function calculateStandings(tournament: Tournament): Standing[] {
  const teamMap = new Map<string, Standing>();
  
  tournament.teams.forEach(t => {
    teamMap.set(t.id, {
      team: t,
      totalPoints: 0,
      kills: 0,
      wwcd: 0,
      matchesPlayed: 0,
      bestPlacement: 999,
    });
  });

  tournament.matches.forEach(match => {
    const results = Array.isArray(match.results) ? match.results : [];
    results.forEach((r: any) => {
      const s = teamMap.get(r.teamId);
      if (!s) return;
      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 0;
      const isWWCD = !!r.wwcd;
      const placementPts = PLACEMENT_POINTS[placement] || 0;
      s.kills += kills;
      s.totalPoints += kills + placementPts;
      if (isWWCD) s.wwcd += 1;
      s.matchesPlayed += 1;
      if (placement > 0 && placement < s.bestPlacement) s.bestPlacement = placement;
    });
  });

  return Array.from(teamMap.values())
    .filter(s => s.matchesPlayed > 0)
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.wwcd !== a.wwcd) return b.wwcd - a.wwcd;
      return b.kills - a.kills;
    });
}

export default function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [topN, setTopN] = useState(16);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  const standings = tournament ? calculateStandings(tournament).slice(0, topN) : [];

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = (tournament?.name || "standings") + "-points-table.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e: any) {
      alert("Download failed: " + e?.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Tournament not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => router.push("/dashboard/tournaments/" + id)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <label className="text-sm text-neutral-400">Show top:</label>
          <select
            value={topN}
            onChange={e => setTopN(Number(e.target.value))}
            className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
          >
            <option value={8}>Top 8</option>
            <option value={12}>Top 12</option>
            <option value={16}>Top 16</option>
            <option value={20}>Top 20</option>
            <option value={25}>Top 25</option>
            <option value={100}>All Teams</option>
          </select>
          <button
            onClick={download}
            disabled={downloading}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Generating..." : "Download PNG"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto overflow-hidden">
        <div
          ref={cardRef}
          style={{ width: "1920px", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)" }}
          className="p-16 mx-auto"
        >
          <div className="flex items-center justify-between mb-12 border-b-4 border-yellow-500 pb-8">
            <div>
              <div className="text-yellow-400 text-2xl font-bold tracking-widest mb-2">OFFICIAL STANDINGS</div>
              <h1 className="text-7xl font-black text-white mb-2">{tournament.name}</h1>
              <div className="text-neutral-400 text-2xl">Overall Points Table Top {standings.length}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-8xl">TROPHY</div>
              <div className="text-neutral-500 text-xl mt-2">TournaOps.com</div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4 text-yellow-400 font-bold text-2xl tracking-wider border-b-2 border-neutral-700 pb-4">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-5">TEAM</div>
            <div className="col-span-1 text-center">MATCHES</div>
            <div className="col-span-1 text-center">WWCD</div>
            <div className="col-span-1 text-center">KILLS</div>
            <div className="col-span-1 text-center">BEST</div>
            <div className="col-span-2 text-center">TOTAL PTS</div>
          </div>

          <div className="space-y-3">
            {standings.map((s, idx) => {
              const rank = idx + 1;
              const bgColor =
                rank === 1 ? "linear-gradient(90deg, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.05) 100%)"
                : rank === 2 ? "linear-gradient(90deg, rgba(192,192,192,0.20) 0%, rgba(192,192,192,0.05) 100%)"
                : rank === 3 ? "linear-gradient(90deg, rgba(205,127,50,0.20) 0%, rgba(205,127,50,0.05) 100%)"
                : "rgba(255,255,255,0.03)";
              const rankColor =
                rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#ffffff";
              return (
                <div
                  key={s.team.id}
                  style={{ background: bgColor }}
                  className="grid grid-cols-12 gap-4 py-5 px-4 rounded-lg items-center border border-neutral-800"
                >
                  <div className="col-span-1 text-center">
                    <span style={{ color: rankColor }} className="text-5xl font-black">
                      #{rank}
                    </span>
                  </div>
                  <div className="col-span-5 flex items-center gap-4">
                    {s.team.logo && (
                      <img
                        src={s.team.logo}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border-2 border-yellow-500"
                        crossOrigin="anonymous"
                      />
                    )}
                    <div>
                      {s.team.tag && <div className="text-yellow-400 text-lg font-bold">[{s.team.tag}]</div>}
                      <div className="text-white text-3xl font-bold">{s.team.name}</div>
                    </div>
                  </div>
                  <div className="col-span-1 text-center text-white text-2xl font-semibold">{s.matchesPlayed}</div>
                  <div className="col-span-1 text-center">
                    <span className="text-yellow-400 text-3xl font-black">{s.wwcd}</span>
                  </div>
                  <div className="col-span-1 text-center text-red-400 text-3xl font-black">{s.kills}</div>
                  <div className="col-span-1 text-center text-neutral-300 text-2xl">#{s.bestPlacement === 999 ? "-" : s.bestPlacement}</div>
                  <div className="col-span-2 text-center">
                    <span className="text-yellow-400 text-5xl font-black">{s.totalPoints}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t-2 border-neutral-800 flex items-center justify-between text-neutral-500 text-xl">
            <div>Powered by TournaOps.com</div>
            <div>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>
      </div>
    </div>
  );
}