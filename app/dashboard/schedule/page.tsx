"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Trash2, Download } from "lucide-react";
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
}

export default function SchedulePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [schedule, setSchedule] = useState<ScheduleMatch[]>([]);

  useEffect(() => {
    (async () => {
      const t = await getMyTournaments();
      setTournaments(t || []);
      if (t && t.length > 0) {
        setSelected(t[0].id);
        loadSchedule(t[0].id);
      }
    })();
  }, []);

  const loadSchedule = (id: string) => {
    try {
      const saved = localStorage.getItem(`schedule_${id}`);
      if (saved) setSchedule(JSON.parse(saved));
      else setSchedule([]);
    } catch { setSchedule([]); }
  };

  const addMatch = () => {
    const newMatch: ScheduleMatch = {
      id: Math.random().toString(36).substring(2, 10),
      matchName: `Match ${schedule.length + 1}`,
      map: "Erangel",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
    };
    const updated = [...schedule, newMatch];
    setSchedule(updated);
    if (selected) localStorage.setItem(`schedule_${selected}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Schedule Builder</h1>
        <p className="text-gray-400 mt-1">Plan match times and manage lobby codes</p>
      </div>

      <div className="glass-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <select value={selected} onChange={e => { setSelected(e.target.value); loadSchedule(e.target.value); }} className="input-field w-auto text-sm">
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <span className="text-gray-500 text-sm">{schedule.length} matches</span>
          <button onClick={addMatch} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm ml-auto">
            <Plus className="w-4 h-4" />Add Match
          </button>
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Schedule Yet</h3>
          <p className="text-gray-500 mb-6">Add your first match</p>
          <button onClick={addMatch} className="btn-primary px-6 py-2.5">
            <Plus className="w-4 h-4" />Add Match
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {schedule.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/8">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-mono">{m.time}</span>
              <span className="text-white flex-1">{m.matchName}</span>
              <span className="text-gray-500 text-sm">{m.map}</span>
              <button onClick={() => {
                const updated = schedule.filter(s => s.id !== m.id);
                setSchedule(updated);
                if (selected) localStorage.setItem(`schedule_${selected}`, JSON.stringify(updated));
              }} className="p-1.5 rounded-lg text-gray-700 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}