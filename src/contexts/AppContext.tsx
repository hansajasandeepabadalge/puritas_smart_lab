"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Route, Session } from "@/utils/types";
import { supabase } from "@/lib/supabase";

// ─── Context Types ────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  session: Session | null;
  toastMessage: string;
  toastVisible: boolean;
  toastError: boolean;
  go: (route: Route, extras?: Partial<AppState>) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  showToast: (message: string, error?: boolean) => void;
  setFilters: (filters: AppState["filters"]) => void;
  setDesignerEffluent: (val: string) => void;
  setDesignerProject: (val: string) => void;
  resetDesignerFilters: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    route: "login",
    editingId: null,
    filters: {},
    designerEffluent: "",
    designerProject: "",
  });

  const [session, setSessionState] = useState<Session | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastError, setToastError] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate session from Supabase on mount and subscribe to auth changes
  useEffect(() => {
    async function loadSession() {
      const {
        data: { session: supaSession },
      } = await supabase.auth.getSession();

      if (supaSession?.user) {
        await applySupaSession(supaSession.user.id);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, supaSession) => {
      if (supaSession?.user) {
        await applySupaSession(supaSession.user.id);
      } else {
        setSessionState(null);
        setState({
          route: "login",
          editingId: null,
          filters: {},
          designerEffluent: "",
          designerProject: "",
        });
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applySupaSession(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display, role")
      .eq("id", userId)
      .single();

    if (profile) {
      const sess: Session = {
        username: profile.username,
        role: profile.role as Session["role"],
        display: profile.display,
      };
      setSessionState(sess);
      setState((prev) => ({ ...prev, route: prev.route === "login" ? "main" : prev.route }));
    }
  }

  const showToast = useCallback((message: string, error = false) => {
    setToastMessage(message);
    setToastError(error);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const go = useCallback((route: Route, extras: Partial<AppState> = {}) => {
    setState((prev) => ({ ...prev, route, ...extras }));
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      // Look up the email address for this username from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username.toLowerCase().trim())
        .single();

      if (profileError || !profile?.email) return false;

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      if (error) return false;
      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const setFilters = useCallback((filters: AppState["filters"]) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);

  const setDesignerEffluent = useCallback((val: string) => {
    setState((prev) => ({ ...prev, designerEffluent: val, designerProject: "" }));
  }, []);

  const setDesignerProject = useCallback((val: string) => {
    setState((prev) => ({ ...prev, designerProject: val }));
  }, []);

  const resetDesignerFilters = useCallback(() => {
    setState((prev) => ({ ...prev, designerEffluent: "", designerProject: "" }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        session,
        toastMessage,
        toastVisible,
        toastError,
        go,
        login,
        logout,
        showToast,
        setFilters,
        setDesignerEffluent,
        setDesignerProject,
        resetDesignerFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
