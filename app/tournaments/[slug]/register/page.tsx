"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Check, AlertCircle, Users, Send } from "lucide-react";

export default function PublicRegisterPage() {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    teamName: "",
    teamTag: "",
    contact: "",
    players: [
      { name: "", ign: "", role: "IGL" },
      { name: "", ign: "", role: "Fragger" },
      { name: "", ign: "", role: "Entry" },
      { name: "", ign: "", role: "Support" },
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/public/tournaments/${params.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) setSubmitted(true);
      else setError(data.error || "Submission failed");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Registration Sent!</h2>
        <p className="text-gray-400">The organizer will review your request. Good luck!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Users className="text-indigo-400" /> Team Registration
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Team Name</label>
            <input required value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" placeholder="Team Alpha" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Contact (WhatsApp/Discord)</label>
            <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" placeholder="+977..." />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Roster</h3>
          {formData.players.map((p, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <input required value={p.name} onChange={e => {
                const p2 = [...formData.players]; p2[i].name = e.target.value; setFormData({...formData, players: p2});
              }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="Name" />
              <input required value={p.ign} onChange={e => {
                const p2 = [...formData.players]; p2[i].ign = e.target.value; setFormData({...formData, players: p2});
              }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" placeholder="IGN" />
              <select value={p.role} onChange={e => {
                const p2 = [...formData.players]; p2[i].role = e.target.value; setFormData({...formData, players: p2});
              }} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                <option value="IGL">IGL</option><option value="Fragger">Fragger</option><option value="Support">Support</option><option value="Entry">Entry</option>
              </select>
            </div>
          ))}
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
        
        <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          {loading ? "Submitting..." : <><Send size={18}/> Submit Registration</>}
        </button>
      </form>
    </div>
  );
}