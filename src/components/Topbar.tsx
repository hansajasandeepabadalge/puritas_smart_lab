"use client";

import Image from "next/image";
import { useApp } from "@/contexts/AppContext";
import styles from "@/styles/Topbar.module.css";

export default function Topbar() {
  const { session, go, logout } = useApp();
  if (!session) return null;

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <Image
          src="/puritas-logo.jpg"
          alt="Puritas logo"
          width={128}
          height={44}
          className={styles.brandLogo}
          priority
        />
        <span>Puritas Smart Lab</span>
      </div>
      <div className={styles.navActions}>
        <button
          id="nav-home-btn"
          className={styles.navLink}
          onClick={() => go("main")}
        >
          Home
        </button>
        <div className={styles.currentUser}>
          Current User: <strong>{session.username}</strong> · {session.display}
        </div>
        <button
          id="nav-logout-btn"
          className="btn btn-ghost"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
