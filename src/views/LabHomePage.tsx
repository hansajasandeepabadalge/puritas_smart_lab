"use client";

import { useApp } from "@/contexts/AppContext";

export default function LabHomePage() {
  const { go } = useApp();

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <h1>Lab User</h1>
          <p>Manage laboratory test records and maintain accurate project data.</p>
        </div>
        <button id="lab-back-btn" className="btn btn-ghost" onClick={() => go("main")}>
          ← Back
        </button>
      </div>

      <div className="module-grid">
        {/* ── Insert Card ── */}
        <div className="card module-card">
          <div>
            <div className="module-icon" aria-hidden="true">＋</div>
            <h3>Insert New Data</h3>
            <p>
              Create a new wastewater laboratory record with reference details
              and measured parameters.
            </p>
          </div>
          <button
            id="insert-new-btn"
            className="btn btn-primary"
            onClick={() => go("insert")}
          >
            Insert New Data
          </button>
        </div>

        {/* ── Edit Card ── */}
        <div className="card module-card">
          <div>
            <div className="module-icon" aria-hidden="true">✎</div>
            <h3>Edit Existing Data</h3>
            <p>
              Search existing laboratory records and update previously saved
              values.
            </p>
          </div>
          <button
            id="edit-existing-btn"
            className="btn btn-primary"
            onClick={() => go("edit-list")}
          >
            Edit Existing Data
          </button>
        </div>
      </div>
    </main>
  );
}
