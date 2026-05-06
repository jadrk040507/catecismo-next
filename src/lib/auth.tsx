"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

interface AuthState {
  user: { id?: string; email?: string; full_name?: string; role?: string } | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCatechist: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
  isParent: boolean;
  isSuspended: boolean;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isCatechist: false,
  isSuperAdmin: false,
  isStudent: false,
  isParent: false,
  isSuspended: false,
  role: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCatechist, setIsCatechist] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isSuspended, setIsSuspended] = useState(false);

  function deriveRoles(r: string) {
    setIsAdmin(r === "admin" || r === "super_admin");
    setIsCatechist(r === "catechist" || r === "admin" || r === "super_admin");
    setIsSuperAdmin(r === "super_admin");
    setIsStudent(r === "user" || r === "student");
    setIsParent(r === "parent");
    setIsSuspended(r === "suspended");
    setRole(r);
  }

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const r = session.user.user_metadata?.role || "user";
        setUser({ id: session.user.id, email: session.user.email, full_name: session.user.user_metadata?.full_name, role: r });
        setIsLoggedIn(true);
        deriveRoles(r);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const r = session.user.user_metadata?.role || "user";
        setUser({ id: session.user.id, email: session.user.email, full_name: session.user.user_metadata?.full_name, role: r });
        setIsLoggedIn(true);
        deriveRoles(r);
      } else {
        setUser(null); setIsLoggedIn(false);
        setIsAdmin(false); setIsCatechist(false); setIsSuperAdmin(false);
        setIsStudent(false); setIsParent(false); setIsSuspended(false); setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const supabase = getSupabase();
    if (!supabase) throw new Error("No supabase configured");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function register(email: string, password: string, full_name: string) {
    const supabase = getSupabase();
    if (!supabase) throw new Error("No supabase configured");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw error;
  }

  async function logout() {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, isCatechist, isSuperAdmin, isStudent, isParent, isSuspended, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}