"use client";

import { useApp } from "@/contexts/AppContext";

export default function MainPage() {
  const { session, go, showToast } = useApp();
  const canLab = session?.role === "lab" || session?.role === "admin";

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <span className="badge">Laboratory Data Management</span>
          <h1>Select your module</h1>
          <p>
            Choose the workspace relevant to your role. Lab Users can enter and
            update test data. Designers can search and compare historical records.
          </p>
        </div>
      </div>

      <div className="module-grid">
        {/* ── Lab User Card ── */}
        <div className="card module-card">
          <div>
            <div className="module-icon" aria-hidden="true">🧪</div>
            <h3>Lab User</h3>
            <p>
              Insert new laboratory records, search existing data, and update
              test results.
            </p>
          </div>
          <button
            id="open-lab-btn"
            className="btn btn-primary"
            disabled={!canLab}
            onClick={() =>
              canLab
                ? go("lab-home")
                : showToast(
                    "Your account does not have Lab User permission.",
                    true
                  )
            }
          >
            Open Lab User
          </button>
        </div>

        {/* ── Designer Card ── */}
        <div className="card module-card">
          <div>
            <div className="module-icon" aria-hidden="true">📊</div>
            <h3>Designer</h3>
            <p>
              Filter by effluent type and project, then review historical
              wastewater test results.
            </p>
          </div>
          <button
            id="open-designer-btn"
            className="btn btn-primary"
            onClick={() => go("designer")}
          >
            Open Designer
          </button>
        </div>
      </div>
    </main>
  );
}
