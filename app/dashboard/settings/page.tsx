"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, AtSign, Save, Shield,
  LogOut, Trash2, Check, Sun, Moon,
  Monitor, Bell, Globe, Key
} from "lucide-react";
import { getCurrentUser, updateUser, logoutUser } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setDisplayName(u?.displayName || "");
    const savedTheme = localStorage.getItem("tournaops_theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateUser({ displayName });
      setUser(getCurrentUser());
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  const handleTheme = (t: "dark" | "light") => {
    setTheme(t);
    localStorage.setItem("tournaops_theme", t);
  };

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />Profile
        </h2>

        <div className="flex items-center gap-4 mb-6 p-4 bg-white/4 rounded-xl border border-white/8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{user.displayName || user.username}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-gray-600 text-xs mt-0.5">@{user.username}  Member since {memberSince}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">
              <Mail className="w-3.5 h-3.5 inline mr-1" />Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
            <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">
              <AtSign className="w-3.5 h-3.5 inline mr-1" />Username
            </label>
            <input
              type="text"
              value={user.username}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
            <p className="text-gray-600 text-xs mt-1">Username cannot be changed</p>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2.5">
            {saved ? (
              <><Check className="w-4 h-4 text-green-300" />Saved!</>
            ) : saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4" />Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-purple-400" />Appearance
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-3">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTheme("dark")}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0a0a0f] border border-white/20 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-400"}`}>Dark</p>
                  <p className="text-gray-600 text-xs">Default</p>
                </div>
                {theme === "dark" && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
              </button>

              <button
                onClick={() => handleTheme("light")}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Sun className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${theme === "light" ? "text-white" : "text-gray-400"}`}>Light</p>
                  <p className="text-gray-600 text-xs">Coming soon</p>
                </div>
                {theme === "light" && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />Account
        </h2>
        <div className="space-y-3">
          {[
            { label: "Account Type", value: "Free Plan", badge: "badge-draft" },
            { label: "Member Since", value: memberSince },
            { label: "User ID", value: user.id, mono: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl bg-white/4 border border-white/8">
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className={`text-gray-500 text-xs mt-0.5 ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
              </div>
              {item.badge && <span className={`badge ${item.badge}`}>Free</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl border border-red-500/15 p-6">
        <h2 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />Danger Zone
        </h2>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left group"
        >
          <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
          <div>
            <p className="text-white text-sm font-medium group-hover:text-red-300 transition-colors">Sign Out</p>
            <p className="text-gray-600 text-xs">Sign out of your account on this device</p>
          </div>
        </button>
      </div>
    </div>
  );
}