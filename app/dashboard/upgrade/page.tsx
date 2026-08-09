"use client";
import { useDialog } from "@/lib/use-confirm";
import { useState, useEffect } from "react";
import { Check, Crown, Zap, Loader2, Sparkles } from "lucide-react";

export default function UpgradePage() {
  const dialog = useDialog();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetch("/api/payments/status")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setStatus(d);
      })
      .catch(() => setStatus({ isPro: false }))
      .finally(() => setLoadingStatus(false));
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST" });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        void dialog.alert({ title: "Checkout Failed", description: data.error || "Checkout failed. Please try again.", variant: "danger" });
      }
    } catch (e) {
      void dialog.alert({ title: "Checkout Error", description: "Failed to start checkout. Please try again.", variant: "danger" });
    } finally {
      setLoading(false);
    }
  }

  const proFeatures = [
    "Unlimited tournaments",
    "Up to 400 teams per tournament",
    "All scoring systems (PMGC, PMPL, Community)",
    "OBS broadcasting overlays",
    "AI tournament assistant (Groq)",
    "Discord integration",
    "Multi-stage tournaments",
    "Public tournament pages",
    "Team registration system",
    "Priority email support",
    "7-day free trial",
  ];

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Level Up Your Tournaments
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock unlimited tournaments, AI assistance, and professional features 
            to run world-class PUBG Mobile events.
          </p>
        </div>

        {status?.isPro ? (
          <div className="bg-green-900/30 border border-green-500 rounded-2xl p-8 text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You are already Pro!</h2>
            <p className="text-gray-400">
              Enjoy unlimited access to all features. Thank you for your support!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Free</h2>
                <p className="text-gray-400 text-sm">Perfect for trying out</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "3 tournaments",
                  "32 teams max",
                  "Basic scoring",
                  "OBS overlays",
                  "Discord integration",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full py-3 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            <div className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-2xl p-8 border-2 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold">Pro</h2>
                </div>
                <p className="text-gray-400 text-sm">For serious organizers</p>
              </div>
              <div className="mb-2">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-yellow-400 text-sm mb-6">7-day free trial</p>
              <ul className="space-y-3 mb-8">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Secure payment powered by Dodo Payments</p>
          <p className="mt-1">SSL encrypted â€¢ Cancel anytime â€¢ Made in Nepal</p>
        </div>
      </div>
    </div>
  );
}