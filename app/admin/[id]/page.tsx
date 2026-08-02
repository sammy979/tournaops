"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2, Download, Users, RefreshCw, Trash2, Check, GitBranch, ListChecks, Trophy, Grid3x3 } from "lucide-react";
import BracketTree from "@/components/BracketTree";
import StandingsTable from "@/components/StandingsTable";
import TeamsTable from "@/components/TeamsTable";
import TeamEditor from "@/components/TeamEditor";
import MatchCard from "@/components/MatchCard";
import { getTournament, saveTournament, deleteTournament } from "@/lib/storage";
import { advanceWinner, calculateStandings, createTournament } from "@/lib/bracket-engine";
import type { Tournament, Match, Team } from "@/types/tournament";

type TabType = "bracket" | "teams" | "standings" | "matches";

export default function AdminPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("bracket");
  const bracketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = getTournament(params.id as string);
    if (!t) {
      router.push("/");
      return;
    }
    setTournament(t);
  }, [params.id, router]);

  const handleMatchUpdate = (updated: Match) => {
    if (!tournament) return;
    let newMatches = tournament.matches.map(m => m.id === updated.id ? updated : m);
    if (updated.isComplete && updated.winner) {
      newMatches = advanceWinner(newMatches, updated);
    }
    const newTournament = { ...tournament, matches: newMatches };
    setTournament(newTournament);
    saveTournament(newTournament);
  };

  const handleTeamsSave = (teams: Team[]) => {
    if (!tournament) return;
    const newMatches = tournament.matches.map(match => ({
      ...match,
      team1: match.team1 ? teams.find(t => t.id === match.team1!.id) || match.team1 : match.team1,
      team2: match.team2 ? teams.find(t => t.id === match.team2!.id) || match.team2 : match.team2,
    }));
    const newTournament = { ...tournament, teams, matches: newMatches };
    setTournament(newTournament);
    saveTournament(newTournament);
    setShowTeamEditor(false);
  };

  const handleReset = () => {
    if (!tournament || !confirm("Reset all match results? This cannot be undone.")) return;
    const newT = createTournament(
      tournament.name, tournament.game, tournament.teamCount,
      tournament.format, tournament.bestOf, tournament.seedingType
    );
    newT.id = tournament.id;
    newT.teams = tournament.teams;
    const teamsMap = new Map(tournament.teams.map(t => [t.seed, t]));
    newT.matches.forEach(m => {
      if (m.team1?.seed) m.team1 = teamsMap.get(m.team1.seed) || m.team1;
      if (m.team2?.seed) m.team2 = teamsMap.get(m.team2.seed) || m.team2;
    });
    setTournament(newT);
    saveTournament(newT);
  };

  const handleDelete = () => {
    if (!tournament || !confirm("Delete this tournament permanently?")) return;
    deleteTournament(tournament.id);
    router.push("/");
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/bracket/${tournament!.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPNG = async () => {
    if (!bracketRef.current) return;
    const { toPng } = await import("html-to-image");
    try {
      const dataUrl = await toPng(bracketRef.current, { backgroundColor: "#050510", pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${tournament!.name}-tournaops.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Export failed. Try again.");
    }
  };

  const exportPDF = async () => {
    if (!bracketRef.current) return;
    const { toPng } = await import("html-to-image");
    const { jsPDF } = await import("jspdf");
    try {
      const dataUrl = await toPng(bracketRef.current, { backgroundColor: "#050510", pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1600, 900] });
      pdf.addImage(dataUrl, "PNG", 0, 0, 1600, 900);
      pdf.save(`${tournament!.name}-tournaops.pdf`);
    } catch (err) {
      console.error(err);
      alert("Export failed. Try again.");
    }
  };

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isBracket = tournament.format === "single_elim" || tournament.format === "double_elim";
  const standings = calculateStandings(tournament);
  
  const tabs: {id: TabType; name: string; icon: any; show: boolean}[] = [
    { id: "bracket", name: "Bracket", icon: GitBranch, show: isBracket },
    { id: "standings", name: "Standings", icon: Trophy, show: !isBracket },
    { id: "teams", name: "Teams", icon: Users, show: true },
    { id: "matches", name: "All Matches", icon: Grid3x3, show: true }
  ].filter(t => t.show);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="glass-heavy border-b border-purple-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="w-10 h-10 rounded-xl glass border border-purple-500/30 flex items-center justify-center hover:border-cyan-400 transition">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-display text-2xl md:text-3xl font-black gradient-text truncate">{tournament.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {tournament.game}
                  </span>
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {tournament.teamCount} Teams
                  </span>
                  <span className="text-[10px] text-pink-400 uppercase tracking-widest font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/30">
                    {tournament.format.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowTeamEditor(true)} className="btn-ghost text-xs inline-flex items-center gap-2">
                <Users className="w-4 h-4" /> TEAMS
              </button>
              <button onClick={copyShareLink} className="btn-ghost text-xs inline-flex items-center gap-2">
                {copied ? <><Check className="w-4 h-4 text-green-400" /> COPIED!</> : <><Share2 className="w-4 h-4" /> SHARE</>}
              </button>
              <button onClick={exportPNG} className="btn-ghost text-xs inline-flex items-center gap-2">
                <Download className="w-4 h-4" /> PNG
              </button>
              <button onClick={exportPDF} className="btn-ghost text-xs inline-flex items-center gap-2">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button onClick={handleReset} className="btn-ghost text-xs inline-flex items-center gap-2 !text-yellow-400 !border-yellow-500/30">
                <RefreshCw className="w-4 h-4" /> RESET
              </button>
              <button onClick={handleDelete} className="btn-ghost text-xs !text-red-400 !border-red-500/30">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-purple-500/20 pb-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-display font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? "text-cyan-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg shadow-cyan-500/50"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "bracket" && isBracket && (
          <div ref={bracketRef} className="glass rounded-3xl p-6 fade-in-up">
            <BracketTree matches={tournament.matches} editable={true} onUpdate={handleMatchUpdate} />
          </div>
        )}
        
        {activeTab === "standings" && (
          <div className="fade-in-up">
            <StandingsTable standings={standings} />
          </div>
        )}
        
        {activeTab === "teams" && (
          <div className="fade-in-up">
            <TeamsTable teams={tournament.teams} onEditTeams={() => setShowTeamEditor(true)} />
          </div>
        )}
        
        {activeTab === "matches" && (
          <div className="fade-in-up">
            <div className="glass-heavy rounded-3xl overflow-hidden border-2 border-purple-500/30 relative">
              <div className="px-6 py-5 border-b border-purple-500/20 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/50">
                    <ListChecks className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black gradient-text">ALL MATCHES</h3>
                    <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold mt-1">
                      {tournament.matches.length} matches · {tournament.matches.filter(m => m.isComplete).length} complete
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournament.matches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    editable={true} 
                    onUpdate={handleMatchUpdate}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showTeamEditor && (
        <TeamEditor
          teams={tournament.teams}
          onSave={handleTeamsSave}
          onClose={() => setShowTeamEditor(false)}
        />
      )}
    </main>
  );
}