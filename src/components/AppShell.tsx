"use client";

import { useEffect, useState } from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Toast from "@/components/Toast";
import LoginPage from "@/views/LoginPage";
import MainPage from "@/views/MainPage";
import RecordForm from "@/views/RecordForm";
import EditListPage from "@/views/EditListPage";
import DesignsPage from "@/views/DesignsPage";
import DesignForm from "@/views/DesignForm";
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
      <DashboardLayout><MainPage /></DashboardLayout>
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
      <DashboardLayout><MainPage /></DashboardLayout>
    );
  }

  // ── Route renderer ──
  let content: React.ReactNode;

  switch (state.route) {
    case "main":
      content = <MainPage />;
      break;

    case "lab-home":
      content = <EditListPage />;
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

    case "designer-home":
      content = <DesignsPage />;
      break;

    case "add-design":
      content = <DesignForm />;
      break;

    case "designer":
      content = <DesignsPage />;
      break;

    default:
      content = <MainPage />;
  }

  return (
    <DashboardLayout>{content}</DashboardLayout>
  );
}

// ── Async loader for the edit-form route ─────────────────────────────────────

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="app-main">
        <Topbar onMenu={() => setMenuOpen(true)} />
        {children}
      </div>
      <Toast />
    </div>
  );
}

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
