"use client";

import { useState } from "react";
import { Twitter, MessageSquare, Link, Check, Share2, Instagram, Copy } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { getLeaderboard } from "@/lib/storage/tournaments";

interface SharePanelProps {
  tournament: Tournament;
  onClose: () => void;
}

export default function SharePanel({ tournament, onClose }: SharePanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const leaderboard = getLeaderboard(tournament);
  const leader = leaderboard[0];
  const base = typeof window !== "undefined" ? window.location.origin : "https://tournaops.com";
  const publicUrl = `${base}/tournaments/${tournament.slug}`;
  const registerUrl = `${base}/tournaments/${tournament.slug}/register`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const twitterTexts = [
    {
      label: "Tournament Announcement",
      text: `🏆 ${tournament.name} is LIVE!\n\n👥 ${tournament.teams.length} squads competing\n🗺️ ${tournament.mapRotation.join(", ")}\n💰 Prize Pool: ${tournament.prizePool || "TBA"}\n\n📊 Live standings:\n${publicUrl}\n\n#PUBGMobile #BGMI #Esports #Tournament`,
    },
    {
      label: "Current Leader",
      text: leader
        ? `🥇 ${leader.teamName} is leading ${tournament.name} with ${leader.totalPoints} points and ${leader.totalKills} kills!\n\nFollow live:\n${publicUrl}\n\n#PUBGMobile #BGMI #Esports`
        : `📊 ${tournament.name} is underway! Follow live standings:\n${publicUrl}\n\n#PUBGMobile #BGMI`,
    },
    {
      label: "Team Registration Open",
      text: `📝 Registrations OPEN for ${tournament.name}!\n\n👥 ${tournament.teams.length}/${tournament.maxTeams} squads registered\n🏆 Prize: ${tournament.prizePool || "TBA"}\n\nRegister your team:\n${registerUrl}\n\n#PUBGMobile #BGMI #Tournament`,
    },
    {
      label: "Champion Announcement",
      text: leaderboard.length > 0
        ? `🏆 CHAMPIONS! ${leaderboard[0]?.teamName} wins ${tournament.name}!\n\n🥇 ${leaderboard[0]?.teamName} — ${leaderboard[0]?.totalPoints}pts\n🥈 ${leaderboard[1]?.teamName || "—"} — ${leaderboard[1]?.totalPoints || 0}pts\n🥉 ${leaderboard[2]?.teamName || "—"} — ${leaderboard[2]?.totalPoints || 0}pts\n\nPowered by TournaOps tournaops.com\n\n#PUBGMobile #BGMI #Esports`
        : `🏆 ${tournament.name} has ended! Check final results:\n${publicUrl}`,
    },
  ];

  const openTwitter = (text: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const openWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const links = [
    { label: "Public Tournament Page", url: publicUrl, desc: "Share with spectators" },
    { label: "Team Registration Link", url: registerUrl, desc: "Share with teams to register" },
    { label: "OBS Overlay URL", url: `${base}/overlay/${tournament.id}`, desc: "Browser source for streaming" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              Share Tournament
            </h2>
            <p className="text-gray-500 text-sm mt-1">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
            <Check className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Links</p>
            <div className="space-y-2">
              {links.map(link => (
                <div key={link.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{link.label}</p>
                    <p className="text-gray-600 text-xs">{link.desc}</p>
                    <code className="text-blue-400 text-xs truncate block mt-0.5">{link.url}</code>
                  </div>
                  <button
                    onClick={() => copy(link.url, link.label)}
                    className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
                      copied === link.label
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-white/10 hover:border-white/20 text-gray-400"
                    }`}
                  >
                    {copied === link.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Twitter / X Templates */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Twitter / X Templates
            </p>
            <div className="space-y-3">
              {twitterTexts.map((t, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/4 border border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 text-xs font-semibold">{t.label}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copy(t.text, `tw-${i}`)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border transition-all ${
                          copied === `tw-${i}`
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : "border-white/10 hover:border-white/20 text-gray-400"
                        }`}
                      >
                        {copied === `tw-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                      <button
                        onClick={() => openTwitter(t.text)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <Twitter className="w-3 h-3" />
                        Tweet
                      </button>
                      <button
                        onClick={() => openWhatsApp(t.text)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        WA
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line line-clamp-3">{t.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Embed Standings</p>
            <div className="p-4 rounded-xl bg-black/40 border border-white/8">
              <code className="text-green-400 text-xs break-all">
                {`<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" style="border-radius:12px"></iframe>`}
              </code>
              <button
                onClick={() => copy(`<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" style="border-radius:12px"></iframe>`, "embed")}
                className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-xs border transition-all ${
                  copied === "embed"
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-white/10 hover:border-white/20 text-gray-400"
                }`}
              >
                {copied === "embed" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy Embed Code
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-secondary px-6 py-2">Close</button>
        </div>
      </div>
    </div>
  );
}