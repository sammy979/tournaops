"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Check, X, Clock } from "lucide-react";

interface TournamentItem {
  id: string;
  name: string;
}

interface RegistrationPlayer {
  name: string;
  ign?: string;
  role?: string;
}

interface RegistrationItem {
  id: string;
  teamName: string;
  teamTag?: string;
  contact?: string;
  players: RegistrationPlayer[];
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export default function RegistrationsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selected, setSelected] = useState("");
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");

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

  const loadRegistrations = useCallback((id: string) => {
    if (!id) return;
    setLoading(true);
    fetch("/api/tournaments/" + id + "/registrations")
      .then((r) => r.json())
      .then((data) => setRegistrations(Array.isArray(data.registrations) ? data.registrations : []))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) loadRegistrations(selected);
  }, [selected, loadRegistrations]);

  const updateStatus = async (registrationId: string, action: "approve" | "reject") => {
    if (!selected) return;
    setProcessingId(registrationId);
    try {
      const res = await fetch("/api/tournaments/" + selected + "/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update registration");
        return;
      }
      setRegistrations(data.registrations || []);
    } catch {
      alert("Failed to update registration");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Registrations</h1>
        <p className="text-gray-500 mt-1">Manage team registration requests</p>
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
          {loading && <span className="text-gray-500 text-sm">Loading...</span>}
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white/5 rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Registrations</h3>
          <p className="text-gray-500">Share the registration link with teams.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-white font-bold">{reg.teamName}</h3>
                  <p className="text-gray-500 text-xs">{reg.players?.length || 0} players</p>
                  <p className="text-gray-600 text-xs mt-1">Status: {reg.status}</p>
                </div>

                {reg.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(reg.id, "approve")}
                      disabled={processingId === reg.id}
                      className="px-4 py-2 rounded-xl bg-green-500/15 text-green-400 border border-green-500/20 text-sm disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 inline mr-1" />Approve
                    </button>
                    <button
                      onClick={() => updateStatus(reg.id, "reject")}
                      disabled={processingId === reg.id}
                      className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5 inline mr-1" />Reject
                    </button>
                  </div>
                )}
              </div>

              {reg.players && reg.players.length > 0 && (
                <div className="mt-4 grid md:grid-cols-2 gap-2">
                  {reg.players.map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <p className="text-white text-sm font-medium">{p.name || "Unnamed Player"}</p>
                      <p className="text-gray-500 text-xs">
                        {p.ign ? "IGN: " + p.ign : "No IGN"}{p.role ? " • " + p.role : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}