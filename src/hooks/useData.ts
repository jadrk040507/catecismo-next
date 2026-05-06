"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  lessons_completed: number;
  streak_days: number;
  last_active: string;
  created_at: string;
}

export interface LessonStat {
  id?: string;
  title?: string;
  lesson_name?: string;
  completions: number;
  avg_quiz_score: number;
  avg_time: string;
}

export interface DashboardStats {
  users: number;
  completed: number;
  active: number;
  catechists: number;
  streakAvg: number;
}

// ─── useUsers ────────────────────────────────────────────────────────────────

export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) { setUsers([]); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data || []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, loading, refetch: fetchUsers };
}

// ─── useStats ────────────────────────────────────────────────────────────────

export function useStats() {
  const [stats, setStats] = useState<DashboardStats>({ users: 0, completed: 0, active: 0, catechists: 0, streakAvg: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*");
    const profiles = (data || []) as Profile[];
    const today = new Date().toISOString().split("T")[0];
    setStats({
      users: profiles.length,
      completed: profiles.reduce((s, p) => s + (p.lessons_completed || 0), 0),
      active: profiles.filter((p) => p.last_active?.startsWith(today)).length,
      catechists: profiles.filter((p) => ["catechist", "admin", "super_admin"].includes(p.role)).length,
      streakAvg: profiles.length
        ? Math.round(profiles.reduce((s, p) => s + (p.streak_days || 0), 0) / profiles.length)
        : 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

// ─── useLessonStats ──────────────────────────────────────────────────────────

export function useLessonStats() {
  const [lessons, setLessons] = useState<LessonStat[]>([]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.from("lesson_stats").select("*").order("completions", { ascending: false }).then(({ data }) => {
      setLessons((data || []) as LessonStat[]);
    });
  }, []);

  return lessons;
}

// ─── usePromoteUser ──────────────────────────────────────────────────────────

export function usePromoteUser(refetch: () => void) {
  const [pending, setPending] = useState(false);

  async function promote(userId: string) {
    setPending(true);
    const supabase = getSupabase();
    if (!supabase) throw new Error("No supabase configured");
    const { error } = await (supabase.from("profiles") as any).update({ role: "admin" }).eq("id", userId);
    setPending(false);
    if (error) throw error;
    refetch();
  }

  return { promote, pending };
}

// ─── useCreateUser (super_admin) ────────────────────────────────────────────

export function useCreateUser(refetch: () => void) {
  const [pending, setPending] = useState(false);

  async function createUser(opts: {
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) {
    setPending(true);
    try {
      // Use GoTrue Admin API to create user without affecting current session
      const { adminCreateUser } = await import("@/lib/supabase");
      const result = await adminCreateUser(opts);

      // Insert/update profile with the correct role
      const supabase = getSupabase();
      if (!supabase) throw new Error("No supabase configured");

      const { error: profileError } = await (supabase.from("profiles") as any)
        .upsert({
          id: result.id,
          email: opts.email,
          full_name: opts.full_name || opts.email.split("@")[0],
          role: opts.role,
        }, { onConflict: "id" });

      if (profileError) console.warn("Profile upsert warning:", profileError.message);

      refetch();
      return result;
    } finally {
      setPending(false);
    }
  }

  return { createUser, pending };
}

// ─── useSuspendUser (super_admin) ───────────────────────────────────────────

export function useSuspendUser(refetch: () => void) {
  const [pending, setPending] = useState(false);

  async function suspend(userId: string) {
    setPending(true);
    const supabase = getSupabase();
    if (!supabase) throw new Error("No supabase configured");
    const { error } = await (supabase.from("profiles") as any)
      .update({ role: "suspended" })
      .eq("id", userId);
    setPending(false);
    if (error) throw error;
    refetch();
  }

  async function unsuspend(userId: string, previousRole: string) {
    setPending(true);
    const supabase = getSupabase();
    if (!supabase) throw new Error("No supabase configured");
    const { error } = await (supabase.from("profiles") as any)
      .update({ role: previousRole })
      .eq("id", userId);
    setPending(false);
    if (error) throw error;
    refetch();
  }

  return { suspend, unsuspend, pending };
}

// ─── useResetPassword (super_admin) ─────────────────────────────────────────

export function useResetPassword() {
  const [pending, setPending] = useState(false);

  async function resetPassword(email: string) {
    setPending(true);
    const supabase = getSupabase();
    if (!supabase) throw new Error("No supabase configured");
    // Send password reset email via Supabase auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : undefined,
    });
    setPending(false);
    if (error) throw error;
  }

  return { resetPassword, pending };
}

// ─── useRealtimeUsers ────────────────────────────────────────────────────────

export function useRealtimeUsers(onChange: () => void) {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel("dashboard-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, onChange)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [onChange]);
}