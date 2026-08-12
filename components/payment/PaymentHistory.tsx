"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  planDuration: string;
  transactionId: string;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments");
        if (!res.ok) throw new Error("Failed to fetch payment history");
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "var(--green)";
      case "rejected": return "var(--red)";
      default: return "var(--amber)";
    }
  };

  const methodLabel = (method: string) => {
    switch (method) {
      case "esewa": return "eSewa";
      case "khalti": return "Khalti";
      case "bank_transfer": return "Bank Transfer";
      default: return method;
    }
  };

  if (loading) {
    return <div style={{ color: "var(--white-40)", fontSize: "0.875rem", padding: "1rem" }}>Loading payment history...</div>;
  }

  if (error) {
    return <div style={{ color: "var(--red)", fontSize: "0.875rem", padding: "1rem" }}>{error}</div>;
  }

  if (payments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--white-40)" }}>
        No payment history found.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {payments.map((payment) => (
        <div
          key={payment.id}
          style={{
            padding: "1rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, color: "var(--white)", fontSize: "1rem" }}>
              Rs {payment.amount} — {methodLabel(payment.method)}
            </div>
            <div style={{ color: "var(--white-40)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {payment.planDuration} plan · {new Date(payment.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--white-40)", marginTop: "0.25rem" }}>
              ID: {payment.transactionId}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              color: statusColor(payment.status),
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "capitalize",
            }}>
              {payment.status}
            </span>
            {payment.approvedAt && (
              <div style={{ color: "var(--white-40)", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                Approved {new Date(payment.approvedAt).toLocaleDateString()}
              </div>
            )}
            {payment.rejectionReason && (
              <div style={{ color: "var(--red)", fontSize: "0.7rem", marginTop: "0.25rem", maxWidth: "200px" }}>
                {payment.rejectionReason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}