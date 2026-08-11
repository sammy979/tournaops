"use client";

import { useState } from "react";
import AdminShell from "@/components/ui/AdminShell";
import {
  CreditCard,
  Search,
  Download,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

type PaymentStatus = "success" | "failed" | "refunded" | "pending";

interface Payment {
  id:        string;
  user:      string;
  email:     string;
  plan:      string;
  amount:    number;
  status:    PaymentStatus;
  method:    string;
  date:      string;
  invoiceId: string;
}

const MOCK_PAYMENTS: Payment[] = [
  { id: "pay1",  user: "DarkMatter",  email: "dark@email.com",       plan: "Pro+ Monthly",  amount: 49.99,  status: "success",  method: "Visa •••• 4242",    date: "2025-07-15 09:32", invoiceId: "INV-001234" },
  { id: "pay2",  user: "ShadowX",     email: "shadow@email.com",     plan: "Pro Monthly",   amount: 19.99,  status: "success",  method: "Mastercard •••• 8888",date: "2025-07-14 14:11", invoiceId: "INV-001233" },
  { id: "pay3",  user: "StarBlast",   email: "star@email.com",       plan: "Pro Monthly",   amount: 19.99,  status: "failed",   method: "Visa •••• 1234",    date: "2025-07-13 11:05", invoiceId: "INV-001232" },
  { id: "pay4",  user: "GhostRider",  email: "ghost@email.com",      plan: "Pro Annual",    amount: 179,    status: "success",  method: "PayPal",             date: "2025-07-12 16:44", invoiceId: "INV-001231" },
  { id: "pay5",  user: "NightOwl",    email: "nightowl@email.com",   plan: "Pro Monthly",   amount: 19.99,  status: "refunded", method: "Visa •••• 5555",    date: "2025-07-10 08:21", invoiceId: "INV-001230" },
  { id: "pay6",  user: "Apex",        email: "apex@email.com",       plan: "Pro+ Annual",   amount: 479,    status: "success",  method: "Mastercard •••• 7777",date: "2025-07-08 13:58", invoiceId: "INV-001229" },
  { id: "pay7",  user: "Inferno",     email: "inferno@email.com",    plan: "Pro Monthly",   amount: 19.99,  status: "success",  method: "Visa •••• 3333",    date: "2025-07-06 10:14", invoiceId: "INV-001228" },
  { id: "pay8",  user: "ProStrike",   email: "pro@email.com",        plan: "Pro Monthly",   amount: 19.99,  status: "pending",  method: "Bank Transfer",      date: "2025-07-05 17:30", invoiceId: "INV-001227" },
];

const STATUS_CFG: Record<PaymentStatus, { label: string; badge: string }> = {
  success:  { label: "Success",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  failed:   { label: "Failed",   badge: "bg-rose-500/15 text-rose-400 border-rose-500/20"         },
  refunded: { label: "Refunded", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20"      },
  pending:  { label: "Pending",  badge: "bg-blue-500/15 text-blue-400 border-blue-500/20"         },
};

export default function AdminPaymentsPage() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");

  const filtered = MOCK_PAYMENTS.filter(p => {
    const q = search.toLowerCase();
    const matchQ = p.user.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.invoiceId.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || p.status === statusFilter;
    return matchQ && matchS;
  });

  const successTotal  = MOCK_PAYMENTS.filter(p => p.status === "success").reduce((a, p) => a + p.amount, 0);
  const refundTotal   = MOCK_PAYMENTS.filter(p => p.status === "refunded").reduce((a, p) => a + p.amount, 0);
  const failedCount   = MOCK_PAYMENTS.filter(p => p.status === "failed").length;
  const pendingCount  = MOCK_PAYMENTS.filter(p => p.status === "pending").length;

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
            <p className="text-white/40 text-sm mt-0.5">Transaction history and revenue tracking</p>
          </div>
          <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 px-3 py-2 rounded-lg text-sm transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue",  value: `$${successTotal.toLocaleString("en", {minimumFractionDigits:2})}`, color: "text-emerald-400", icon: DollarSign   },
            { label: "Total Refunds",  value: `$${refundTotal.toFixed(2)}`,   color: "text-amber-400",  icon: RefreshCw    },
            { label: "Failed Payments",value: failedCount,                    color: "text-rose-400",   icon: XCircle      },
            { label: "Pending",        value: pendingCount,                   color: "text-blue-400",   icon: CreditCard   },
          ].map(s => (
            <div key={s.label} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-xs">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, email, or invoice ID…"
              className="w-full bg-[#0f1117] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/40" />
          </div>
          <div className="flex gap-2">
            {(["all", "success", "failed", "refunded", "pending"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-rose-600 text-white" : "bg-white/[0.04] text-white/30 border border-white/[0.08] hover:text-white/60"}`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Invoice", "User", "Plan", "Amount", "Method", "Status", "Date", ""].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-white/30 text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const cfg = STATUS_CFG[p.status];
                return (
                  <tr key={p.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-white/30 text-xs font-mono">{p.invoiceId}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-white text-sm font-medium">{p.user}</p>
                      <p className="text-white/30 text-xs">{p.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-white/60 text-sm">{p.plan}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-sm font-bold ${p.status === "failed" ? "text-rose-400 line-through opacity-50" : p.status === "refunded" ? "text-amber-400" : "text-emerald-400"}`}>
                        ${p.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white/40 text-sm">{p.method}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-white/30 text-xs font-mono">{p.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {p.status === "failed" && (
                          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-amber-400 transition-colors" title="Retry">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {p.status === "success" && (
                          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-rose-400 transition-colors" title="Refund">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-white/60 transition-colors" title="View">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}