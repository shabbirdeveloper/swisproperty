import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

/**
 * Auth with roles.
 *  - role: "admin" | "agent" | null
 *  - agent: the agent's own record (id, approved, ...) when role === "agent"
 * Admins and agents are separate accounts distinguished by their profile role.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [agent, setAgent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setRole(null);
      setAgent(null);
      setProfile(null);
      return;
    }
    // role + display info from profiles
    const { data: prof } = await supabase
      .from("profiles")
      .select("role, full_name, avatar")
      .eq("id", sessionUser.id)
      .maybeSingle();
    const r = prof?.role || "agent";
    setRole(r);
    setProfile(
      prof
        ? { fullName: prof.full_name || "", avatar: prof.avatar || "" }
        : { fullName: "", avatar: "" }
    );

    if (r === "agent") {
      const { data: agentRow } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", sessionUser.id)
        .maybeSingle();
      setAgent(agentRow || null);
    } else {
      setAgent(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      await loadRole(u);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await loadRole(u);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRole]);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured)
      throw new Error("Supabase is not configured. Add keys to .env.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await loadRole(data.user);
    return data.user;
  };

  const signUpAgent = async ({
    email,
    password,
    name,
    designation,
    phone,
    whatsapp,
  }) => {
    if (!isSupabaseConfigured)
      throw new Error("Supabase is not configured. Add keys to .env.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "agent", name, designation, phone, whatsapp },
      },
    });
    if (error) throw error;

    // Safety net: create the profile + agent record from the app, so the agent
    // always shows up for admin approval even if the DB trigger isn't present.
    // (Requires a session, i.e. "Confirm email" turned off in Supabase.)
    if (data.user && data.session) {
      try {
        await supabase
          .from("profiles")
          .upsert({ id: data.user.id, role: "agent" }, {
            onConflict: "id",
            ignoreDuplicates: true,
          });
        await supabase.from("agents").upsert(
          {
            user_id: data.user.id,
            name,
            designation,
            email,
            phone,
            whatsapp,
            approved: false,
          },
          { onConflict: "email", ignoreDuplicates: true }
        );
      } catch {
        /* the DB trigger / backfill will cover it */
      }
    }
    return data;
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured)
      throw new Error("Supabase is not configured. Add keys to .env.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured)
      throw new Error("Supabase is not configured. Add keys to .env.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const signUpCustomer = async ({ email, password, fullName }) => {
    if (!isSupabaseConfigured)
      throw new Error("Supabase is not configured. Add keys to .env.");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: "customer", name: fullName } },
    });
    if (error) throw error;
    if (data.user && data.session) {
      try {
        await supabase
          .from("profiles")
          .upsert(
            { id: data.user.id, role: "customer", full_name: fullName },
            { onConflict: "id" }
          );
      } catch {
        /* trigger covers profile creation */
      }
    }
    return data;
  };

  const updateMyProfile = async ({ fullName, avatar }) => {
    if (!isSupabaseConfigured || !user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar })
      .eq("id", user.id);
    if (error) throw error;
    setProfile({ fullName, avatar });
  };

  const refreshAgent = useCallback(async () => {
    if (user) await loadRole(user);
  }, [user, loadRole]);

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setAgent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        agent,
        profile,
        loading,
        signIn,
        signUpAgent,
        signUpCustomer,
        updateMyProfile,
        signOut,
        refreshAgent,
        resetPassword,
        updatePassword,
        isAdmin: role === "admin",
        isAgent: role === "agent",
        isCustomer: role === "customer",
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
