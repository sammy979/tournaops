"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { User, Shield, Trophy, Target } from "lucide-react";

interface Player {
  id: string;
  name: string;
  pubgId?: string;
  role?: string;
  team: {
    id: string;
    name: string;
    tag?: string;
    tournament: {
      id: string;
      name: string;
      slug: string;
      status: string;
    };
  };
}

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/players/${params.id}`)
      .then((r) => r.json())
      .then((d) => setPlayer(d.player))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl">Player not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 text-center mb-6">
          <div className="w-24 h-24 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold">{player.name}</h1>
          {player.pubgId && (
            <p className="text-gray-400 mt-1">PUBG ID: {player.pubgId}</p>
          )}
          {player.role && (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm">
              {player.role}
            </span>
          )}
        </div>

        {/* Team Info */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            Team
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{player.team.name}</p>
              {player.team.tag && (
                <p className="text-gray-400 text-sm">[{player.team.tag}]</p>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tournament
          </h2>
          <a
            href={`/tournaments/${player.team.tournament.slug}`}
            className="block hover:bg-gray-800 rounded-lg p-3 transition-colors"
          >
            <p className="font-semibold">{player.team.tournament.name}</p>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              player.team.tournament.status === "live"
                ? "bg-green-500/20 text-green-400"
                : player.team.tournament.status === "completed"
                ? "bg-gray-500/20 text-gray-400"
                : "bg-blue-500/20 text-blue-400"
            }`}>
              {player.team.tournament.status}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}