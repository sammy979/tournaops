"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Loader2 } from "lucide-react";

type Tournament = {
  id: string;
  name: string;
  teams: any[];
  matches: any[];
  brandingData?: any;
  sponsorLogos?: any;
  discord?: string;
};

type Size = { name: string; width: number; height: number; label: string };
const SIZES: Size[] = [
  { name: "youtube", width: 1920, height: 1080, label: "YouTube / Twitter (16:9)" },
  { name: "instagram", width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  { name: "story", width: 1080, height: 1920, label: "Instagram Story (9:16)" },
];

export default function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [topN, setTopN] = useState(10);
  const [size, setSize] = useState<Size>(SIZES[0]);
  const [subtitle, setSubtitle] = useState("Overall Standings");
  const [showSponsors, setShowSponsors] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetch("/api/tournaments/" + id)
      .then(r => r.json())
      .then(d => setTournament(d.tournament))
      .finally(() => setLoading(false));
  }, [id]);

  // Update preview when settings change
  useEffect(() => {
    if (!tournament) return;
    setPreviewLoading(true);
    const params = new URLSearchParams({
      top: String(topN),
      subtitle: subtitle,
      format: size.name,
      sponsors: showSponsors ? "1" : "0",
      social: showSocial ? "1" : "0",
      t: String(Date.now()),
    });
    const url = "/api/tournaments/" + id + "/screenshot?" + params.toString();
    setPreviewUrl(url);
  }, [tournament, topN, size, subtitle, showSponsors, showSocial, id]);

  const download = async () => {
    if (!previewUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(previewUrl);
      if (!res.ok) throw new Error("Server returned " + res.status);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.download = (tournament?.name || "standings") + "-" + size.name + "-" + Date.now() + ".png";
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (e: any) {
      alert("Download failed: " + e?.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;
  if (!tournament) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Tournament not found</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => router.push("/dashboard/tournaments/" + id)} className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-sm text-neutral-400 hidden sm:block">
            Server-rendered - Guaranteed Perfect Quality
          </div>
          <button onClick={download} disabled={downloading} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 sm:px-6 py-2.5 rounded-lg disabled:opacity-50 text-sm sm:text-base">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Downloading..." : "Download " + size.width + "x" + size.height}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Controls */}
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Format</label>
              <select value={size.name} onChange={e => setSize(SIZES.find(s => s.name === e.target.value) || SIZES[0])} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                {SIZES.map(s => <option key={s.name} value={s.name}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Show Top</label>
              <select value={topN} onChange={e => setTopN(Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm">
                <option value={5}>Top 5</option>
                <option value={8}>Top 8</option>
                <option value={10}>Top 10</option>
                <option value={12}>Top 12</option>
                <option value={16}>Top 16</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Subtitle</label>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm" placeholder="Overall Standings" />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input type="checkbox" checked={showSponsors} onChange={e => setShowSponsors(e.target.checked)} className="w-4 h-4" /> Sponsors
              </label>
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input type="checkbox" checked={showSocial} onChange={e => setShowSocial(e.target.checked)} className="w-4 h-4" /> Social
              </label>
            </div>
          </div>
        </div>

        {/* Preview: Server-rendered image */}
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="text-xs text-neutral-500 mb-3 text-center">
            Live Preview - {size.width}x{size.height} (image renders on server, downloads same file)
          </div>
          <div className="flex items-center justify-center bg-black rounded-lg p-2 overflow-hidden" style={{ minHeight: 400 }}>
            {previewUrl && (
              <img
                key={previewUrl}
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto"
                style={{ maxHeight: "70vh" }}
                onLoad={() => setPreviewLoading(false)}
                onError={() => setPreviewLoading(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}