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
import { clearSession, getSession, setSession } from "@/services/storageService";
import { DEMO_USERS } from "@/config/constants";

// ─── Context Types ────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  session: Session | null;
  toastMessage: string;
  toastVisible: boolean;
  toastError: boolean;
  go: (route: Route, extras?: Partial<AppState>) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
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
  // Always start with login/null so server and client HTML match
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

  // Hydrate session from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = getSession();
    if (stored) {
      setSessionState(stored);
      setState((prev) => ({ ...prev, route: "main" }));
    }
  }, []);

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

  const login = useCallback((username: string, password: string): boolean => {
    const user = DEMO_USERS[username.toLowerCase()];
    if (!user || user.password !== password) return false;
    const sess: Session = {
      username: username.toLowerCase(),
      role: user.role,
      display: user.display,
    };
    setSession(sess);
    setSessionState(sess);
    setState((prev) => ({ ...prev, route: "main" }));
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    setState({
      route: "login",
      editingId: null,
      filters: {},
      designerEffluent: "",
      designerProject: "",
    });
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
