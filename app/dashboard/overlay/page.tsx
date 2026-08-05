"use client";
import { useState, useEffect } from "react";
import { Copy, ExternalLink, Monitor, Check, Palette, Trophy, Loader2, Radio } from "lucide-react";

interface Tournament {
  id: string;
  slug: string;
  name: string;
  status: string;
  overlayToken?: string;
}

const OVERLAY_TYPES = [
  { key: "", label: "Live Standings", icon: Trophy, description: "Main leaderboard for streams" },
  { key: "chicken-dinner", label: "Chicken Dinner", icon: Trophy, description: "WWCD announcement" },
  { key: "top-fragger", label: "Top Fragger", icon: Radio, description: "MVP kill leader" },
  { key: "next-match", label: "Next Match", icon: Monitor, description: "Upcoming match countdown" },
  { key: "final-results", label: "Final Results", icon: Trophy, description: "Tournament winner" },
  { key: "match", label: "Current Match", icon: Radio, description: "Live match stats" },
];

export default function OverlaySetupPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [overlayType, setOverlayType] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        const list = data.tournaments || [];
        setTournaments(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.tournaops.com";
  const overlayPath = overlayType ? `/${overlayType}` : "";
  const overlayUrl = selected?.overlayToken
    ? `${baseUrl}/overlay/${selected.overlayToken}${overlayPath}`
    : "";

  async function copyUrl() {
    if (!overlayUrl) return;
    await navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Monitor className="w-8 h-8 text-yellow-400" />
            OBS Broadcasting Overlays
          </h1>
          <p className="text-gray-400 mt-1">
            Professional overlays for your live streams. Copy URL and paste into OBS Browser Source.
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Tournaments Yet</h2>
            <p className="text-gray-400 mb-4">
              Create a tournament first to get overlay URLs.
            </p>
            <a
              href="/dashboard/tournaments/create"
              className="inline-block px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
            >
              Create Tournament
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Configuration */}
            <div className="lg:col-span-1 space-y-4">
              {/* Tournament Selector */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                  Select Tournament
                </label>
                <select
                  value={selected?.id || ""}
                  onChange={(e) => {
                    const t = tournaments.find((tm) => tm.id === e.target.value);
                    setSelected(t || null);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Overlay Type */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <label className="text-sm font-semibold text-gray-300 mb-3 block">
                  Overlay Type
                </label>
                <div className="space-y-2">
                  {OVERLAY_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setOverlayType(type.key)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          overlayType === type.key
                            ? "bg-yellow-400/10 border-yellow-400 text-yellow-400"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon className="w-4 h-4" />
                          <span className="font-semibold text-sm">{type.label}</span>
                        </div>
                        <p className="text-xs opacity-70 pl-6">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: URL + Preview */}
            <div className="lg:col-span-2 space-y-4">
              {/* URL Copy */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Copy className="w-5 h-5 text-yellow-400" />
                  Your Overlay URL
                </h2>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={overlayUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono"
                  />
                  <button
                    onClick={copyUrl}
                    className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={overlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>

                {/* OBS Instructions */}
                <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-yellow-400 mb-2">
                    📺 OBS Studio Setup:
                  </p>
                  <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Add new source → <strong>Browser Source</strong></li>
                    <li>Paste URL: <code className="bg-black/50 px-2 py-0.5 rounded text-yellow-400 text-xs">Copy above</code></li>
                    <li>Width: <strong>1920</strong> — Height: <strong>1080</strong></li>
                    <li>Check &quot;Refresh browser when scene becomes active&quot;</li>
                    <li>Click OK — overlay appears in your scene!</li>
                  </ol>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-yellow-400" />
                    Live Preview
                  </h2>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-semibold">
                    🔴 LIVE
                  </span>
                </div>
                <div className="bg-black aspect-video relative">
                  {overlayUrl ? (
                    <iframe
                      src={overlayUrl}
                      className="w-full h-full border-0"
                      title="Overlay Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      Select a tournament to preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}