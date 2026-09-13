"use client";

import { useApp } from "@/contexts/AppContext";

/**
 * Convenience hook that returns only what's needed for navigation.
 */
export function useNavigation() {
  const { go, session, logout } = useApp();
  return { go, session, logout };
}
