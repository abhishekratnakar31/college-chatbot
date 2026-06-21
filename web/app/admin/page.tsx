"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  BarChart3, Users, Newspaper, Activity, RefreshCw,
  ChevronLeft, LayoutDashboard, MessageSquare, Clock, AlertTriangle, Shield, ShieldOff,
  PanelLeftClose, PanelLeft, CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006";

interface Stats {
  totalUsers: number;
  totalSessions: number;
  activeToday: number;
  totalNews: number;
  totalTokens?: number;
  totalCost?: number;
  activeUsers?: number;
}

interface ActivityItem {
  id: number;
  uid: string;
  email: string | null;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
}

interface FirebaseUser {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  createdAt: string;
  lastSignIn: string;
  disabled: boolean;
}

interface ActivitySummary {
  uid: string;
  email: string;
  queries: number;
  last_active: string;
}

interface ApiUsageStats {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  byModel: { model: string; calls: number; tokens: number; cost: number }[];
  daily: { date: string; calls: number; tokens: number; cost: number }[];
  byEndpoint: { endpoint: string; calls: number; tokens: number; cost: number }[];
}

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [firebaseUsers, setFirebaseUsers] = useState<FirebaseUser[]>([]);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsageStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "activity" | "api-usage">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403) {
          setIsAdmin(false);
          setAdminCheckDone(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch stats");
        setIsAdmin(true);
        setAdminCheckDone(true);
        const data = await res.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } catch {
        setIsAdmin(false);
        setAdminCheckDone(true);
      }
    })();
  }, [user, token, authLoading, router]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    if (activeTab === "users") {
      fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setFirebaseUsers(data.firebaseUsers || []);
          setAdminEmails(data.adminEmails || []);
          setActivitySummary(data.activitySummary || []);
        })
        .catch(console.error);
    }
    if (activeTab === "api-usage") {
      fetch(`${API_URL}/admin/api-usage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setApiUsage(data))
        .catch(console.error);
    }
  }, [isAdmin, token, activeTab]);

  const refreshStats = async () => {
    if (!token) return;
    const [statsRes, apiUsageRes] = await Promise.all([
      fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/admin/api-usage`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (statsRes.ok) {
      const data = await statsRes.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
    }
    if (apiUsageRes.ok) {
      setApiUsage(await apiUsageRes.json());
    }
  };

  const toggleAdmin = async (u: FirebaseUser, isCurrentlyAdmin: boolean) => {
    if (!token) return;
    if (isCurrentlyAdmin) {
      if (!confirm(`Remove admin access from ${u.email}?`)) return;
      await fetch(`${API_URL}/admin/users/${u.uid}/promote`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await fetch(`${API_URL}/admin/users/${u.uid}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: u.email, name: u.name }),
      });
    }
    const data = await fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    setAdminEmails(data.adminEmails || []);
    setFirebaseUsers(data.firebaseUsers || []);
    setActivitySummary(data.activitySummary || []);
  };

  if (authLoading || !adminCheckDone) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6">
        <div className="bg-white border-2 border-black rounded-[2rem] p-10 shadow-[4px_4px_0px_0px_#000] max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-black mb-2">Access Denied</h1>
          <p className="text-zinc-600 mb-6">You do not have admin privileges.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#b69cc4] text-black border-2 border-black font-black text-sm rounded-lg hover:bg-[#a387b3] transition-all shadow-[2px_2px_0px_0px_#000]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000]"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#b69cc4]/20 border-2 border-black rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-black" />
        </div>
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-black">{value}</p>
    </motion.div>
  );

  const adminSet = new Set(adminEmails);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "api-usage" as const, label: "API Usage", icon: CreditCard },
    { id: "activity" as const, label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-black flex items-center gap-2">
              <LayoutDashboard size={18} />
              Admin Dashboard
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={refreshStats}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded-lg font-black text-[10px] shadow-[1.5px_1.5px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-53px)]">
        {/* Sidebar */}
        <aside className={`hidden md:flex flex-col shrink-0 border-r-2 border-black bg-white transition-all duration-200 ${
          sidebarOpen ? "w-52 p-3" : "w-14 p-2 items-center"
        }`}>
          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-9 h-9 bg-white border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all mb-2"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
          </button>
          <nav className={`flex flex-col gap-1 ${sidebarOpen ? "" : "items-center"}`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 border-2 border-black rounded-xl font-black text-xs transition-all shadow-[1.5px_1.5px_0px_0px_#000] ${
                  sidebarOpen ? "px-4 py-3" : "p-2.5 justify-center"
                } ${
                  activeTab === tab.id
                    ? "bg-[#b69cc4] text-black"
                    : "bg-white text-black hover:bg-zinc-50"
                }`}
                title={!sidebarOpen ? tab.label : undefined}
              >
                <tab.icon size={16} />
                {sidebarOpen && tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black rounded-xl font-black text-[10px] whitespace-nowrap transition-all shadow-[1.5px_1.5px_0px_0px_#000] ${
                activeTab === tab.id
                  ? "bg-[#b69cc4] text-black"
                  : "bg-white text-black"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 py-4 md:px-6 max-w-5xl">

        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#b69cc4]/20 border-2 border-black rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-black" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Users</span>
                </div>
                <p className="text-3xl font-black">{stats?.totalUsers ?? "—"}</p>
                <p className="text-[10px] font-bold text-zinc-400 mt-1">
                  {stats?.activeUsers != null ? `${stats.activeUsers} active` : "—"}
                </p>
              </div>
              <StatCard icon={MessageSquare} label="Total Queries" value={stats?.totalSessions ?? "—"} />
              <StatCard icon={Clock} label="Active (24h)" value={stats?.activeToday ?? "—"} />
              <StatCard icon={Newspaper} label="News Articles" value={stats?.totalNews ?? "—"} />
              <StatCard icon={BarChart3} label="Total Tokens" value={stats?.totalTokens != null ? (stats.totalTokens / 1000).toFixed(1) + "K" : "—"} />
              <StatCard icon={BarChart3} label="Total Cost" value={stats?.totalCost != null ? "$" + stats.totalCost.toFixed(4) : "—"} />
            </div>

            <div className="bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
              <div className="px-5 py-4 border-b-2 border-black flex items-center gap-2">
                <Activity size={16} />
                <span className="font-black text-sm">Recent Activity</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 border-black bg-zinc-50">
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Time</th>
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Action</th>
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">User</th>
                      <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Tokens</th>
                      <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400 font-bold">No activity yet</td></tr>
                    )}
                    {recentActivity.slice(0, 15).map((a) => {
                      const tokens = (a.details as any)?.total_tokens;
                      const cost = (a.details as any)?.cost;
                      return (
                      <tr key={a.id} className="border-b border-black/10 hover:bg-zinc-50">
                        <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 bg-[#b69cc4]/20 border border-black rounded text-[10px] font-bold">
                            {a.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{a.email || a.uid.slice(0, 12)}</td>
                        <td className="px-4 py-3 text-right text-zinc-500 text-[10px] font-mono">
                          {tokens ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500 text-[10px] font-mono">
                          {cost != null ? "$" + Number(cost).toFixed(6) : "—"}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
            <div className="px-5 py-4 border-b-2 border-black flex items-center gap-2">
              <Users size={16} />
              <span className="font-black text-sm">Users ({firebaseUsers.length})</span>
              <span className="ml-auto text-[10px] font-bold text-zinc-400">
                {adminEmails.length} admin{adminEmails.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-black bg-zinc-50 sticky top-0">
                    <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Email</th>
                    <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Name</th>
                    <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Role</th>
                    <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Queries</th>
                    <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Last Active</th>
                    <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {firebaseUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400 font-bold">No users found in Firebase</td></tr>
                  )}
                  {firebaseUsers.map((u) => {
                    const isUserAdmin = adminSet.has(u.email);
                    const summary = activitySummary.find((s) => s.email === u.email);
                    return (
                      <tr key={u.uid} className="border-b border-black/10 hover:bg-zinc-50">
                        <td className="px-4 py-3 font-bold">{u.email}</td>
                        <td className="px-4 py-3 text-zinc-600">{u.name || "—"}</td>
                        <td className="px-4 py-3">
                          {isUserAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 border border-black rounded text-[10px] font-black text-purple-800">
                              <Shield size={10} />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 border border-black/30 rounded text-[10px] font-bold text-zinc-500">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{summary?.queries ?? 0}</td>
                        <td className="px-4 py-3 text-zinc-400 text-[10px] font-mono">
                          {summary?.last_active
                            ? new Date(summary.last_active).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isUserAdmin ? (
                            <button
                              onClick={() => toggleAdmin(u, true)}
                              className="p-1.5 bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition-all"
                              title="Remove admin"
                            >
                              <ShieldOff size={14} className="text-red-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleAdmin(u, false)}
                              className="p-1.5 bg-purple-100 border-2 border-black rounded-lg hover:bg-purple-200 transition-all"
                              title="Make admin"
                            >
                              <Shield size={14} className="text-purple-700" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "api-usage" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={CreditCard} label="Total API Calls" value={apiUsage?.totalCalls ?? "—"} />
              <StatCard icon={BarChart3} label="Total Tokens" value={apiUsage?.totalTokens != null ? (apiUsage.totalTokens / 1000).toFixed(1) + "K" : "—"} />
              <StatCard icon={BarChart3} label="Total Cost" value={apiUsage?.totalCost != null ? "$" + apiUsage.totalCost.toFixed(4) : "—"} />
              <StatCard icon={Activity} label="Avg Cost/Call" value={apiUsage && apiUsage.totalCalls > 0 ? "$" + (apiUsage.totalCost / apiUsage.totalCalls).toFixed(6) : "—"} />
            </div>

            {/* By Model */}
            {apiUsage && apiUsage.byModel.length > 0 && (
              <div className="bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] mb-6">
                <div className="px-5 py-4 border-b-2 border-black flex items-center gap-2">
                  <BarChart3 size={16} />
                  <span className="font-black text-sm">By Model</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-zinc-50">
                        <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Model</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Calls</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Tokens</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiUsage.byModel.map((m) => (
                        <tr key={m.model} className="border-b border-black/10 hover:bg-zinc-50">
                          <td className="px-4 py-3 font-bold">{m.model}</td>
                          <td className="px-4 py-3 text-right">{m.calls}</td>
                          <td className="px-4 py-3 text-right font-mono text-[10px]">{(m.tokens / 1000).toFixed(1)}K</td>
                          <td className="px-4 py-3 text-right font-mono text-[10px]">${m.cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* By Endpoint */}
            {apiUsage && apiUsage.byEndpoint.length > 0 && (
              <div className="bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] mb-6">
                <div className="px-5 py-4 border-b-2 border-black flex items-center gap-2">
                  <Activity size={16} />
                  <span className="font-black text-sm">By Endpoint</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-zinc-50">
                        <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Endpoint</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Calls</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Tokens</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiUsage.byEndpoint.map((e) => (
                        <tr key={e.endpoint} className="border-b border-black/10 hover:bg-zinc-50">
                          <td className="px-4 py-3 font-bold text-[10px]">{e.endpoint.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 text-right">{e.calls}</td>
                          <td className="px-4 py-3 text-right font-mono text-[10px]">{(e.tokens / 1000).toFixed(1)}K</td>
                          <td className="px-4 py-3 text-right font-mono text-[10px]">${e.cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Daily Breakdown */}
            {apiUsage && apiUsage.daily.length > 0 && (
              <div className="bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                <div className="px-5 py-4 border-b-2 border-black flex items-center gap-2">
                  <Clock size={16} />
                  <span className="font-black text-sm">Daily Usage (last 30 days)</span>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-black bg-zinc-50 sticky top-0">
                        <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Date</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Calls</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Tokens</th>
                        <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiUsage.daily.map((d) => (
                        <tr key={d.date} className="border-b border-black/10 hover:bg-zinc-50">
                          <td className="px-4 py-3 font-mono text-[10px]">{d.date}</td>
                          <td className="px-4 py-3 text-right">{d.calls}</td>
                          <td className="px-4 py-3 text-right font-mono text-[10px]">{(d.tokens / 1000).toFixed(1)}K</td>
                          <td className="px-4 py-3 text-right font-mono text-[10px]">${d.cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!apiUsage && (
              <div className="text-center py-12 text-zinc-400 font-bold text-xs">No API usage data yet. Usage is tracked as LLM calls are made.</div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
            <div className="px-5 py-4 border-b-2 border-black flex items-center gap-2">
              <Activity size={16} />
              <span className="font-black text-sm">All Activity</span>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                    <tr className="border-b-2 border-black bg-zinc-50 sticky top-0">
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Time</th>
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Action</th>
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">User</th>
                      <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Tokens</th>
                      <th className="text-right px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Cost</th>
                      <th className="text-left px-4 py-3 font-black text-zinc-500 uppercase tracking-widest">Query</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400 font-bold">No activity data. Chat queries will appear here once users interact.</td></tr>
                    )}
                    {recentActivity.map((a) => {
                      const d = a.details as any;
                      const tokens = d?.total_tokens;
                      const cost = d?.cost;
                      const query = d?.query;
                      return (
                      <tr key={a.id} className="border-b border-black/10 hover:bg-zinc-50">
                        <td className="px-4 py-3 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 bg-[#b69cc4]/20 border border-black rounded text-[10px] font-bold">
                            {a.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{a.email || a.uid.slice(0, 12)}</td>
                        <td className="px-4 py-3 text-right text-zinc-500 text-[10px] font-mono">
                          {tokens ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500 text-[10px] font-mono">
                          {cost != null ? "$" + Number(cost).toFixed(6) : "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 max-w-[200px] truncate">
                          {query || "—"}
                        </td>
                      </tr>
                    );})}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
