"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Download, Copy, Check, MapPin } from "lucide-react";
import { getMyTournaments } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

interface ScheduleMatch {
  id: string;
  matchName: string;
  map: string;
  date: string;
  time: string;
  lobbyCode?: string;
  password?: string;
  notes?: string;
}

export default function SchedulePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [schedule, setSchedule] = useState<ScheduleMatch[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = getMyTournaments();
    setTournaments(t);
    if (t.length > 0) {
      setSelected(t[0].id);
      loadSchedule(t[0].id, t[0]);
    }
  }, []);

  const loadSchedule = (id: string, t?: Tournament) => {
    const tournament = t || tournaments.find(t => t.id === id);
    if (!tournament) return;

    // Try load saved schedule
    try {
      const saved = localStorage.getItem(`schedule_${id}`);
      if (saved) {
        setSchedule(JSON.parse(saved));
        return;
      }
    } catch {}

    // Generate from tournament matches
    const today = new Date();
    const generated: ScheduleMatch[] = tournament.matches.slice(0, 20).map((m, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + Math.floor(i / 4));
      const hour = 18 + (i % 4) * 1;
      return {
        id: m.id,
        matchName: m.name,
        map: m.map,
        date: d.toISOString().split("T")[0],
        time: `${String(hour).padStart(2, "0")}:00`,
        lobbyCode: "",
        password: "",
        notes: "",
      };
    });
    setSchedule(generated);
    saveSchedule(id, generated);
  };

  const saveSchedule = (id: string, s: ScheduleMatch[]) => {
    localStorage.setItem(`schedule_${id}`, JSON.stringify(s));
  };

  const updateMatch = (matchId: string, field: keyof ScheduleMatch, value: string) => {
    const updated = schedule.map(m => m.id === matchId ? { ...m, [field]: value } : m);
    setSchedule(updated);
    saveSchedule(selected, updated);
  };

  const addMatch = () => {
    const today = new Date().toISOString().split("T")[0];
    const newMatch: ScheduleMatch = {
      id: Math.random().toString(36).substring(2, 10),
      matchName: `Match ${schedule.length + 1}`,
      map: "Erangel",
      date: today,
      time: "18:00",
      lobbyCode: "",
      password: "",
      notes: "",
    };
    const updated = [...schedule, newMatch];
    setSchedule(updated);
    saveSchedule(selected, updated);
  };

  const removeMatch = (id: string) => {
    const updated = schedule.filter(m => m.id !== id);
    setSchedule(updated);
    saveSchedule(selected, updated);
  };

  const tournament = tournaments.find(t => t.id === selected);

  const exportText = () => {
    if (!tournament) return;
    const lines = [
      `📅 ${tournament.name} — Match Schedule`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      "",
      ...schedule.map(m => [
        `🎮 ${m.matchName} | ${m.map}`,
        `📅 ${new Date(m.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
        `🕐 ${m.time}`,
        m.lobbyCode ? `🔑 Lobby: ${m.lobbyCode} | Pass: ${m.password || "—"}` : "",
        m.notes ? `📝 ${m.notes}` : "",
        "",
      ].filter(Boolean).join("\n")),
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Powered by TournaOps • tournaops.com",
    ].join("\n");
    return lines;
  };

  const copySchedule = () => {
    const text = exportText();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadSchedule = () => {
    const text = exportText();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `schedule-${tournament?.name || "tournament"}.txt`;
    a.click();
  };

  // Group by date
  const byDate = schedule.reduce((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {} as Record<string, ScheduleMatch[]>);

  const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Karakin"];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Schedule Builder</h1>
          <p className="text-gray-400 mt-1">Plan match times and manage lobby codes</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copySchedule} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy for Discord"}
          </button>
          <button onClick={downloadSchedule} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            <Download className="w-4 h-4" />Export
          </button>
        </div>
      </div>

      {/* Tournament select */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={selected}
            onChange={e => { setSelected(e.target.value); loadSchedule(e.target.value); }}
            className="input-field w-auto text-sm"
          >
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <span className="text-gray-500 text-sm">{schedule.length} matches scheduled</span>
          <button onClick={addMatch} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm ml-auto">
            <Plus className="w-4 h-4" />Add Match
          </button>
        </div>
      </div>

      {/* Schedule by date */}
      {Object.keys(byDate).sort().map(date => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-semibold">
              {new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h3>
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-gray-600 text-xs">{byDate[date].length} matches</span>
          </div>

          <div className="space-y-3">
            {byDate[date].sort((a, b) => a.time.localeCompare(b.time)).map(match => (
              <div key={match.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-3 p-4 bg-white/3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <input
                      type="time"
                      value={match.time}
                      onChange={e => updateMatch(match.id, "time", e.target.value)}
                      className="bg-transparent text-blue-300 font-mono font-bold text-sm outline-none border-b border-transparent hover:border-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    value={match.matchName}
                    onChange={e => updateMatch(match.id, "matchName", e.target.value)}
                    className="bg-transparent text-white font-semibold text-sm border-b border-transparent hover:border-white/20 focus:border-blue-500 outline-none flex-1 min-w-32"
                    placeholder="Match name"
                  />

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <select
                      value={match.map}
                      onChange={e => updateMatch(match.id, "map", e.target.value)}
                      className="bg-transparent text-gray-300 text-sm outline-none border-b border-transparent hover:border-white/20 focus:border-blue-500 cursor-pointer"
                    >
                      {MAPS.map(m => <option key={m} value={m} className="bg-[#1a1a2e]">{m}</option>)}
                    </select>
                  </div>

                  <input
                    type="date"
                    value={match.date}
                    onChange={e => updateMatch(match.id, "date", e.target.value)}
                    className="bg-transparent text-gray-500 text-xs outline-none border-b border-transparent hover:border-white/20 focus:border-blue-500"
                  />

                  <button onClick={() => removeMatch(match.id)} className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details row */}
                <div className="grid grid-cols-3 gap-3 p-4 border-t border-white/6">
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase tracking-wider block mb-1">Lobby Code</label>
                    <input
                      type="text"
                      value={match.lobbyCode || ""}
                      onChange={e => updateMatch(match.id, "lobbyCode", e.target.value)}
                      className="input-field text-sm py-1.5 font-mono"
                      placeholder="ABC123"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase tracking-wider block mb-1">Password</label>
                    <input
                      type="text"
                      value={match.password || ""}
                      onChange={e => updateMatch(match.id, "password", e.target.value)}
                      className="input-field text-sm py-1.5 font-mono"
                      placeholder="pass123"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase tracking-wider block mb-1">Notes</label>
                    <input
                      type="text"
                      value={match.notes || ""}
                      onChange={e => updateMatch(match.id, "notes", e.target.value)}
                      className="input-field text-sm py-1.5"
                      placeholder="Any notes..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {schedule.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Schedule Yet</h3>
          <p className="text-gray-500 mb-6">Create a tournament first, then build your match schedule here.</p>
          <button onClick={addMatch} className="btn-primary px-6 py-2.5">
            <Plus className="w-4 h-4" />Add First Match
          </button>
        </div>
      )}
    </div>
  );
}