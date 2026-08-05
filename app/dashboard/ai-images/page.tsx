"use client";
import { useState } from "react";
import { Sparkles, Download, Loader2, Wand2, ImageIcon, Copy, Check } from "lucide-react";

const STYLES = [
  { key: "esports poster", label: "Esports Poster", desc: "Dramatic tournament poster" },
  { key: "cinematic banner", label: "Cinematic Banner", desc: "Movie-style banner" },
  { key: "team logo", label: "Team Logo", desc: "Professional esports logo" },
  { key: "social media post", label: "Social Media", desc: "Instagram/Twitter ready" },
  { key: "gaming wallpaper", label: "Wallpaper", desc: "Desktop background" },
  { key: "podium victory", label: "Victory Podium", desc: "Winner celebration" },
];

const ASPECT_RATIOS = [
  { key: "1:1", label: "Square (1:1)", desc: "Instagram" },
  { key: "16:9", label: "Landscape (16:9)", desc: "YouTube / Banner" },
  { key: "9:16", label: "Portrait (9:16)", desc: "Stories / Reels" },
];

const PROMPT_TEMPLATES = [
  "PUBG Mobile champion holding golden trophy, dramatic sunset, epic pose",
  "Squad of 4 players in tactical gear, ready for battle, muzzle flashes",
  "Massive tournament stage with crowd, spotlights, LED screens showing PUBG gameplay",
  "Chicken dinner celebration, confetti explosion, winning team cheering",
  "Sniper rifle silhouette on Erangel map, sunset background, dramatic",
  "Trophy on pedestal, spotlights, tournament logo, professional",
  "Team standing on podium with medals, crowd applauding, victory moment",
  "Gaming setup with RGB, PUBG on screen, energy drinks, professional streamer",
];

export default function AIImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("esports poster");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
        }),
      });

      const data = await res.json();

      if (data.imageUrl) {
        const item = {
          ...data,
          userPrompt: prompt,
          style,
          aspectRatio,
          timestamp: new Date().toISOString(),
        };
        setGenerated(item);
        setHistory([item, ...history.slice(0, 9)]);
      } else {
        alert(data.error || "Failed to generate");
      }
    } catch (e) {
      alert("Error generating image");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `tournaops-ai-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      window.open(url, "_blank");
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI Image Generator
          </div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Wand2 className="w-10 h-10 text-purple-400" />
            AI Poster & Banner Studio
          </h1>
          <p className="text-gray-400">
            Generate professional esports posters, banners, and social media graphics — powered by AI (FREE!)
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Prompt */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <label className="text-sm font-bold mb-2 block">
                Describe Your Image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Champion team holding trophy at sunset..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:border-purple-400 focus:outline-none resize-none"
              />
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {PROMPT_TEMPLATES.map((template) => (
                    <button
                      key={template}
                      onClick={() => setPrompt(template)}
                      className="w-full text-left text-xs text-gray-400 hover:text-purple-400 hover:bg-gray-800 p-2 rounded transition"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <label className="text-sm font-bold mb-3 block">Style</label>
              <div className="space-y-2">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      style === s.key
                        ? "bg-purple-500/10 border-purple-400 text-purple-400"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs opacity-70">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <label className="text-sm font-bold mb-3 block">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setAspectRatio(r.key)}
                    className={`p-3 rounded-lg border text-center transition ${
                      aspectRatio === r.key
                        ? "bg-purple-500/10 border-purple-400 text-purple-400"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-xs font-bold">{r.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-purple-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500">
              Powered by Flux AI • 100% Free • No signup
            </p>
          </div>

          {/* Right: Preview + History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Result */}
            {generated ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                    Generated Image
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyUrl(generated.imageUrl)}
                      className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy URL"}
                    </button>
                    <button
                      onClick={() => downloadImage(generated.imageUrl)}
                      className="px-3 py-1.5 text-xs bg-purple-500 hover:bg-purple-400 text-white rounded-lg flex items-center gap-1 transition font-semibold"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <img
                    src={generated.imageUrl}
                    alt="Generated"
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                  <div><strong className="text-gray-400">Prompt:</strong> {generated.userPrompt}</div>
                  <div className="mt-1"><strong className="text-gray-400">Style:</strong> {generated.style} • <strong className="text-gray-400">Size:</strong> {generated.width}x{generated.height}</div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 text-center">
                <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Image Yet</h3>
                <p className="text-gray-400 text-sm">
                  Enter a prompt and click Generate to create your first AI image!
                </p>
              </div>
            )}

            {/* History */}
            {history.length > 1 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <h3 className="font-bold mb-3">Recent Generations</h3>
                <div className="grid grid-cols-3 gap-2">
                  {history.slice(1).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setGenerated(item)}
                      className="aspect-square bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-400 transition"
                    >
                      <img
                        src={item.imageUrl}
                        alt={`History ${i}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Pro Tips for Better Images
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Be specific: mention colors, lighting, mood, and setting</li>
            <li>• Include tournament theme: PUBG, esports, gaming, championship</li>
            <li>• Add emotions: victorious, intense, dramatic, celebrating</li>
            <li>• Reference styles: cyberpunk, cinematic, neon, minimalist</li>
            <li>• For posters: mention "professional tournament poster, 4k, sharp text"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}