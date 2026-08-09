"use client";
import { useDialog } from "@/lib/use-confirm";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react";

interface TournamentItem {
  id: string;
  name: string;
}

interface ScheduleMatch {
  id: string;
  matchName: string;
  map: string;
  date: string;
  time: string;
  lobbyCode?: string;
  password?: string;
}

export default function SchedulePage() {
  const dialog = useDialog();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selected, setSelected] = useState("");
  const [schedule, setSchedule] = useState<ScheduleMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        const list = data.tournaments || [];
        setTournaments(list);
        if (list.length > 0) {
          setSelected(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadSchedule = useCallback((id: string) => {
    if (!id) return;
    setLoading(true);
    fetch("/api/tournaments/" + id + "/schedule")
      .then((r) => r.json())
      .then((data) => setSchedule(Array.isArray(data.schedule) ? data.schedule : []))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) loadSchedule(selected);
  }, [selected, loadSchedule]);

  const saveSchedule = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tournaments/" + selected + "/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        void dialog.alert({ title: "Save Failed", description: "Failed to save schedule. Please try again.", variant: "danger" });
      }
    } catch {
      void dialog.alert({ title: "Save Failed", description: "Failed to save schedule. Please try again.", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const addMatch = () => {
    const newMatch: ScheduleMatch = {
      id: Math.random().toString(36).substring(2, 10),
      matchName: "Match " + (schedule.length + 1),
      map: "Erangel",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      lobbyCode: "",
      password: "",
    };
    setSchedule((prev) => [...prev, newMatch]);
  };

  const updateMatch = (id: string, key: keyof ScheduleMatch, value: string) => {
    setSchedule((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );
  };

  const deleteMatch = (id: string) => {
    setSchedule((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white">Schedule Builder</h1>
          <p className="text-gray-400 mt-1">Plan match times and manage lobby codes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addMatch} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Match
          </button>
          <button
            onClick={saveSchedule}
            disabled={saving || !selected}
            className={
              "px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 " +
              (saved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/10 text-white hover:bg-white/20")
            }
          >
            <Save className="w-4 h-4" />{saved ? "Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <span className="text-gray-500 text-sm">{schedule.length} matches</span>
          {loading && <span className="text-gray-500 text-sm">Loading...</span>}
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Schedule Yet</h3>
          <p className="text-gray-500 mb-6">Add your first match</p>
          <button onClick={addMatch} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Match
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((m) => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{m.matchName || "Untitled Match"}</h3>
                <button onClick={() => deleteMatch(m.id)} className="text-red-400 hover:text-red-300 p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <input
                  value={m.matchName}
                  onChange={(e) => updateMatch(m.id, "matchName", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="Match Name"
                />
                <input
                  value={m.map}
                  onChange={(e) => updateMatch(m.id, "map", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="Map"
                />
                <input
                  value={m.date}
                  onChange={(e) => updateMatch(m.id, "date", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <input
                  value={m.time}
                  onChange={(e) => updateMatch(m.id, "time", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="18:00"
                />
                <input
                  value={m.lobbyCode || ""}
                  onChange={(e) => updateMatch(m.id, "lobbyCode", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="Lobby Code"
                />
                <input
                  value={m.password || ""}
                  onChange={(e) => updateMatch(m.id, "password", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}