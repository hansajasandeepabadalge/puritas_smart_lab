"use client";

import { useApp } from "@/contexts/AppContext";

export default function DesignerHomePage() {
  const { go } = useApp();

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <h1>Designer</h1>
          <p>Select a designer option to continue.</p>
        </div>
        <button
          id="designer-home-back-btn"
          className="btn btn-ghost"
          onClick={() => go("main")}
        >
          ← Back
        </button>
      </div>

      <div className="module-grid">
        <div className="card module-card">
          <div>
            <div className="module-icon" aria-hidden="true">＋</div>
            <h3>Add Design</h3>
            <p>Create a treatment design using historical laboratory data and unit operations.</p>
          </div>
          <button
            id="add-design-btn"
            className="btn btn-primary"
            onClick={() => go("add-design")}
          >
            Add Design
          </button>
        </div>

        <div className="card module-card">
          <div>
            <div className="module-icon" aria-hidden="true">📊</div>
            <h3>Preview Data</h3>
            <p>Search and compare historical laboratory records by effluent type and project.</p>
          </div>
          <button
            id="preview-data-btn"
            className="btn btn-primary"
            onClick={() => go("designer")}
          >
            Preview Data
          </button>
        </div>
      </div>
    </main>
  );
}
