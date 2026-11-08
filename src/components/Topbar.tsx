"use client";

import { useApp } from "@/contexts/AppContext";
import { Route } from "@/utils/types";
import styles from "@/styles/Topbar.module.css";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

const TITLES: Record<Route, [string, string]> = {
  login: ["Login", ""],
  main: ["Dashboard", "Overview"],
  "lab-home": ["Laboratory Records", "Laboratory"],
  insert: ["Insert New Data", "Laboratory"],
  "edit-list": ["Laboratory Records", "Laboratory"],
  "edit-form": ["Edit Record", "Laboratory"],
  "designer-home": ["Designs", "Designer"],
  "add-design": ["Add Design", "Designer"],
  "edit-design": ["Edit Design", "Designer"],
  designer: ["Designs", "Designer"],
};

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { session, state, go } = useApp();
  if (!session) return null;
  const [title, crumb] = TITLES[state.route] ?? ["", ""];

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenu}
          aria-label="Open menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={20} />
        </button>
        <div>
          <div className={styles.crumb}>
            Puritas Smart Lab
            {crumb && (
              <>
                {" / "}
                <button
                  className={styles.crumbLink}
                  onClick={() =>
                    go(
                      crumb === "Laboratory"
                        ? "lab-home"
                        : crumb === "Designer"
                          ? "designer-home"
                          : "main"
                    )
                  }
                >
                  {crumb}
                </button>
              </>
            )}
          </div>
          <div className={styles.title}>{title}</div>
        </div>
      </div>
    </header>
  );
}
