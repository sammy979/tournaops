"use client";
import { useDialog } from "@/lib/use-confirm";
import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, Trophy, Users, X, Loader2 } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  slug: string;
  status: string;
  bannerImage?: string;
  trophyImage?: string;
  coverImage?: string;
  sponsorLogos?: string[];
}

interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
}

export default function AssetsPage() {
  const dialog = useDialog();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [current, setCurrent] = useState<Tournament | null>(null);
  const [tab, setTab] = useState<"tournament" | "teams" | "sponsors">("tournament");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        const list = data.tournaments || [];
        setTournaments(list);
        if (list.length > 0) setSelectedTournament(list[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    fetch(`/api/tournaments/${selectedTournament}`)
      .then((r) => r.json())
      .then((data) => {
        setCurrent(data.tournament);
        setTeams(data.tournament?.teams || []);
      });
  }, [selectedTournament]);

  async function uploadImage(file: File, type: string): Promise<string | null> {
    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) return data.url;
      void dialog.alert({ title: "Upload Failed", description: data.error || "Upload failed. Please try again.", variant: "danger" });
      return null;
    } catch {
      void dialog.alert({ title: "Upload Failed", description: "Upload failed. Please try again.", variant: "danger" });
      return null;
    } finally {
      setUploading(null);
    }
  }

  async function updateTournamentAsset(field: string, value: string | string[] | null) {
    if (!selectedTournament) return;
    const res = await fetch(`/api/tournaments/${selectedTournament}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrent(data.tournament);
    }
  }

  async function updateTeamAsset(teamId: string, field: string, value: string | null) {
    const res = await fetch(`/api/tournaments/${selectedTournament}/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setTeams(teams.map(t => t.id === teamId ? { ...t, [field]: value } : t));
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-yellow-400" />
            Assets & Branding
          </h1>
          <p className="text-gray-400 mt-1">Upload real logos, banners, and photos</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Tournaments Yet</h2>
            <a href="/dashboard/tournaments/create" className="inline-block mt-4 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg">
              Create Tournament
            </a>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Select Tournament</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1 mb-6 border-b border-gray-800">
              {[
                { id: "tournament", label: "Tournament", icon: Trophy },
                { id: "teams", label: `Teams (${teams.length})`, icon: Users },
                { id: "sponsors", label: "Sponsors", icon: ImageIcon },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as "tournament" | "teams" | "sponsors")}
                    className={`px-4 py-2 flex items-center gap-2 text-sm font-semibold border-b-2 transition ${
                      tab === t.id ? "border-yellow-400 text-yellow-400" : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {tab === "tournament" && current && (
              <div className="grid md:grid-cols-2 gap-6">
                <UploadCard
                  title="Tournament Banner"
                  description="Wide banner at top (1920x600)"
                  currentUrl={current.bannerImage}
                  isUploading={uploading === "banner"}
                  onUpload={async (file: File) => {
                    const url = await uploadImage(file, "banner");
                    if (url) updateTournamentAsset("bannerImage", url);
                  }}
                  onRemove={() => updateTournamentAsset("bannerImage", null)}
                />
                <UploadCard
                  title="Trophy Image"
                  description="Transparent PNG recommended"
                  currentUrl={current.trophyImage}
                  aspectRatio="square"
                  isUploading={uploading === "trophy"}
                  onUpload={async (file: File) => {
                    const url = await uploadImage(file, "trophy");
                    if (url) updateTournamentAsset("trophyImage", url);
                  }}
                  onRemove={() => updateTournamentAsset("trophyImage", null)}
                />
              </div>
            )}

            {tab === "teams" && (
              <div className="grid md:grid-cols-3 gap-4">
                {teams.length === 0 ? (
                  <div className="col-span-3 bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">No Teams</h3>
                  </div>
                ) : teams.map((team) => (
                  <div key={team.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="mb-3">
                      <div className="font-bold">{team.name}</div>
                      {team.tag && <div className="text-yellow-400 text-xs">[{team.tag}]</div>}
                    </div>
                    <MiniUpload
                      label="Team Logo"
                      currentUrl={team.logo}
                      onUpload={async (file: File) => {
                        const url = await uploadImage(file, "team-logo");
                        if (url) updateTeamAsset(team.id, "logo", url);
                      }}
                      onRemove={() => updateTeamAsset(team.id, "logo", null)}
                    />
                  </div>
                ))}
              </div>
            )}

            {tab === "sponsors" && current && (
              <SponsorsManager
                current={current}
                onUpload={async (file: File) => {
                  const url = await uploadImage(file, "sponsor");
                  if (url) {
                    const existing = Array.isArray(current.sponsorLogos) ? current.sponsorLogos : [];
                    updateTournamentAsset("sponsorLogos", [...existing, url]);
                  }
                }}
                onRemove={(index: number) => {
                  const existing = Array.isArray(current.sponsorLogos) ? current.sponsorLogos : [];
                  updateTournamentAsset("sponsorLogos", existing.filter((_: string, i: number) => i !== index));
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface UploadCardProps {
  title: string;
  description: string;
  currentUrl?: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  aspectRatio?: string;
}

function UploadCard({ title, description, currentUrl, isUploading, onUpload, onRemove, aspectRatio }: UploadCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="mb-3">
        <div className="font-bold">{title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{description}</div>
      </div>
      <div className={`bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 relative overflow-hidden ${
        aspectRatio === "square" ? "aspect-square" : "aspect-video"
      }`}>
        {currentUrl ? (
          <>
            <img src={currentUrl} className="w-full h-full object-cover" alt="" />
            <button onClick={onRemove} className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            {isUploading
              ? <Loader2 className="w-8 h-8 animate-spin" />
              : <><Upload className="w-10 h-10 mb-2" /><span className="text-sm">Upload Image</span></>
            }
          </div>
        )}
      </div>
      <label className="mt-3 block">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        <span className="block w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-center rounded-lg cursor-pointer text-sm">
          {currentUrl ? "Change Image" : "Choose File"}
        </span>
      </label>
    </div>
  );
}

interface MiniUploadProps {
  label: string;
  currentUrl?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function MiniUpload({ label, currentUrl, onUpload, onRemove }: MiniUploadProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 mb-1">{label}</div>
      <div className="aspect-square bg-gray-800 rounded-lg relative overflow-hidden border border-gray-700">
        {currentUrl ? (
          <>
            <img src={currentUrl} className="w-full h-full object-cover" alt="" />
            <button onClick={onRemove} className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded text-white">
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <Upload className="w-6 h-6" />
          </div>
        )}
      </div>
      <label className="mt-2 block">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        <span className="block w-full px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-center rounded cursor-pointer text-xs">
          {currentUrl ? "Change" : "Upload"}
        </span>
      </label>
    </div>
  );
}

interface SponsorsManagerProps {
  current: Tournament;
  onUpload: (file: File) => void;
  onRemove: (index: number) => void;
}

function SponsorsManager({ current, onUpload, onRemove }: SponsorsManagerProps) {
  const sponsors = Array.isArray(current.sponsorLogos) ? current.sponsorLogos : [];
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="font-bold text-lg">Sponsor Logos</h3>
        <p className="text-sm text-gray-400">Add up to 5 sponsors</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {sponsors.map((logo: string, i: number) => (
          <div key={i} className="relative bg-gray-800 rounded-lg p-4 aspect-square flex items-center justify-center">
            <img src={logo} className="max-w-full max-h-full object-contain" alt="" />
            <button onClick={() => onRemove(i)} className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {sponsors.length < 5 && (
          <label className="aspect-square bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            <Upload className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-xs text-gray-500">Add Sponsor</span>
          </label>
        )}
      </div>
    </div>
  );
}