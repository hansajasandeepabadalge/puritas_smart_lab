"use client";

import { useEffect, useState } from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Topbar from "@/components/Topbar";
import Toast from "@/components/Toast";
import LoginPage from "@/views/LoginPage";
import MainPage from "@/views/MainPage";
import LabHomePage from "@/views/LabHomePage";
import RecordForm from "@/views/RecordForm";
import EditListPage from "@/views/EditListPage";
import DesignerPage from "@/views/DesignerPage";
import { fetchRecordById } from "@/services/dbService";
import { LabRecord } from "@/utils/types";

function AppRouter() {
  const { state, session } = useApp();

  // ── Auth guard ──
  if (!session && state.route !== "login") {
    return <LoginPage />;
  }
  if (session && state.route === "login") {
    return (
      <div className="app-shell">
        <Topbar />
        <MainPage />
        <Toast />
      </div>
    );
  }

  // ── Unauthenticated ──
  if (!session) {
    return <LoginPage />;
  }

  // ── Role guards for lab-only routes ──
  const isLabOrAdmin = session.role === "lab" || session.role === "admin";
  const labRoutes = ["lab-home", "insert", "edit-list", "edit-form"];
  if (labRoutes.includes(state.route) && !isLabOrAdmin) {
    return (
      <div className="app-shell">
        <Topbar />
        <MainPage />
        <Toast />
      </div>
    );
  }

  // ── Route renderer ──
  let content: React.ReactNode;

  switch (state.route) {
    case "main":
      content = <MainPage />;
      break;

    case "lab-home":
      content = <LabHomePage />;
      break;

    case "insert":
      content = <RecordForm />;
      break;

    case "edit-list":
      content = <EditListPage />;
      break;

    case "edit-form":
      content = <EditFormLoader editingId={state.editingId} />;
      break;

    case "designer":
      content = <DesignerPage />;
      break;

    default:
      content = <MainPage />;
  }

  return (
    <div className="app-shell">
      <Topbar />
      {content}
      <Toast />
    </div>
  );
}

// ── Async loader for the edit-form route ─────────────────────────────────────

function EditFormLoader({ editingId }: { editingId: string | null }) {
  const { go } = useApp();
  const [record, setRecord] = useState<LabRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editingId) {
      go("edit-list");
      return;
    }
    fetchRecordById(editingId)
      .then((r) => {
        if (!r) go("edit-list");
        else setRecord(r);
      })
      .finally(() => setLoading(false));
  }, [editingId, go]);

  if (loading) {
    return (
      <main className="page">
        <div className="hero">
          <p>Loading record…</p>
        </div>
      </main>
    );
  }

  return record ? <RecordForm record={record} isEdit /> : <EditListPage />;
}

export default function AppShell() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
