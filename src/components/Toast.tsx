"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";

export default function Toast() {
  const { toastMessage, toastVisible, toastError } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (toastVisible) {
      el.className = `toast show${toastError ? " error" : ""}`;
    } else {
      el.className = "toast";
    }
  }, [toastVisible, toastError]);

  return (
    <div
      id="toast"
      ref={ref}
      className="toast"
      aria-live="polite"
      role="status"
    >
      {toastMessage}
    </div>
  );
}
