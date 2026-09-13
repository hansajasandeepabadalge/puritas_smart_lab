"use client";

import { AppProvider, useApp } from "@/contexts/AppContext";
import Topbar from "@/components/Topbar";
import Toast from "@/components/Toast";
import LoginPage from "@/pages/LoginPage";
import MainPage from "@/pages/MainPage";
import LabHomePage from "@/pages/LabHomePage";
import RecordForm from "@/pages/RecordForm";
import EditListPage from "@/pages/EditListPage";
import DesignerPage from "@/pages/DesignerPage";
import { getRecords } from "@/services/storageService";

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

    case "edit-form": {
      const rec = state.editingId
        ? getRecords().find((r) => r.id === state.editingId)
        : null;
      content = rec ? (
        <RecordForm record={rec} isEdit />
      ) : (
        <EditListPage />
      );
      break;
    }

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

export default function AppShell() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
