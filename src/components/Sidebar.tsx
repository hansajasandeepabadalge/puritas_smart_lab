"use client";

import Image from "next/image";
import { useApp } from "@/contexts/AppContext";
import { Route } from "@/utils/types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  DashboardSquare01Icon,
  Logout01Icon,
  RulerIcon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  route: Route;
  /** Extra routes that should highlight this item as active */
  match?: Route[];
  labOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: "Menu",
    items: [
      {
        label: "Dashboard",
        icon: <HugeiconsIcon icon={DashboardSquare01Icon} size={20} />,
        route: "main",
      },
      {
        label: "Laboratory",
        icon: <HugeiconsIcon icon={TestTube01Icon} size={20} />,
        route: "lab-home",
        match: ["insert", "edit-list", "edit-form"],
        labOnly: true,
      },
      {
        label: "Designer",
        icon: <HugeiconsIcon icon={RulerIcon} size={20} />,
        route: "designer-home",
        match: ["add-design", "designer"],
      },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { session, state, go, logout } = useApp();
  if (!session) return null;
  const canLab = session.role === "lab" || session.role === "admin";

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Image
            src="/puritas-logo.jpg"
            alt="Puritas logo"
            width={120}
            height={40}
            className="sidebar-logo"
            priority
          />
          <span className="sidebar-brand-text">Smart Lab</span>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <HugeiconsIcon icon={ArrowRightDoubleIcon} size={16} />
            ) : (
              <HugeiconsIcon icon={ArrowLeftDoubleIcon} size={16} />
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map((section) => {
            const items = section.items.filter((i) => !i.labOnly || canLab);
            if (!items.length) return null;
            return (
              <div key={section.title} className="sidebar-section">
                <div className="sidebar-section-title">{section.title}</div>
                {items.map((item) => {
                  const active =
                    state.route === item.route ||
                    item.match?.includes(state.route);
                  return (
                    <button
                      key={item.route}
                      className={`sidebar-link ${active ? "active" : ""}`}
                      title={item.label}
                      onClick={() => {
                        go(item.route);
                        onClose();
                      }}
                    >
                      <span className="sidebar-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="sidebar-label">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {session.username.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <strong>{session.username}</strong>
              <span>{session.display}</span>
            </div>
          </div>
          <button
            id="nav-logout-btn"
            className="btn btn-ghost sidebar-logout"
            onClick={logout}
            title="Logout"
          >
            <HugeiconsIcon icon={Logout01Icon} size={18} />{" "}
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
