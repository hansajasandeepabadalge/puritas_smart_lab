"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { EFFLUENT_TYPES } from "@/config/constants";
import { fetchRecords } from "@/services/dbService";
import RecordsTable from "@/components/RecordsTable";
import { LabRecord } from "@/utils/types";

export default function DesignerPage() {
  const { state, go, setDesignerEffluent, setDesignerProject, resetDesignerFilters } =
    useApp();

  const [allRecords, setAllRecords] = useState<LabRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all records once; filtering is done client-side for instant responsiveness
  useEffect(() => {
    setLoading(true);
    fetchRecords()
      .then(setAllRecords)
      .catch(() => setAllRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const projects = [
    ...new Set(
      allRecords
        .filter(
          (r) => !state.designerEffluent || r.effluentType === state.designerEffluent
        )
        .map((r) => r.projectName)
    ),
  ].sort();

  const visible = allRecords.filter(
    (r) =>
      (!state.designerEffluent || r.effluentType === state.designerEffluent) &&
      (!state.designerProject || r.projectName === state.designerProject)
  );

  const avgCod = visible.length
    ? Math.round(visible.reduce((s, r) => s + Number(r.cod || 0), 0) / visible.length)
    : 0;
  const avgBod = visible.length
    ? Math.round(visible.reduce((s, r) => s + Number(r.bod || 0), 0) / visible.length)
    : 0;

  return (
    <main className="page">
      <div className="hero">
        <button id="designer-back-btn" className="btn btn-ghost" onClick={() => go("main")}>
          ← Back
        </button>
        <h1>Designer Dashboard</h1>
        <p>
          Search and compare historical laboratory results. This module provides
          view-only access to laboratory records.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="stat-row">
        <div className="card stat-card">
          <div className="value">{loading ? "—" : visible.length}</div>
          <div className="label">Visible Records</div>
        </div>
        <div className="card stat-card">
          <div className="value">{loading ? "—" : projects.length}</div>
          <div className="label">Available Projects</div>
        </div>
        <div className="card stat-card">
          <div className="value">{loading ? "—" : avgCod}</div>
          <div className="label">Average COD</div>
        </div>
        <div className="card stat-card">
          <div className="value">{loading ? "—" : avgBod}</div>
          <div className="label">Average BOD</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <section className="card section-card">
        <div className="section-title">
          <h2>Filter Laboratory Data</h2>
          <span>Select effluent type first, then project</span>
        </div>
        <div className="filter-grid designer">
          <div className="form-group">
            <label htmlFor="designerEffluent">Effluent Type</label>
            <select
              id="designerEffluent"
              value={state.designerEffluent}
              onChange={(e) => setDesignerEffluent(e.target.value)}
            >
              <option value="">Select effluent type</option>
              {EFFLUENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="designerProject">Project Name</label>
            <select
              id="designerProject"
              value={state.designerProject}
              disabled={!state.designerEffluent}
              onChange={(e) => setDesignerProject(e.target.value)}
            >
              <option value="">
                {state.designerEffluent
                  ? "All related projects"
                  : "Select effluent type first"}
              </option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <button
            id="designer-reset-btn"
            className="btn btn-secondary"
            onClick={resetDesignerFilters}
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* ── Table ── */}
      <section className="card section-card">
        <div className="section-title">
          <h2>Historical Laboratory Records</h2>
          <span>{loading ? "Loading…" : `${visible.length} record(s)`}</span>
        </div>
        {loading ? (
          <div className="empty-state">Loading records…</div>
        ) : (
          <RecordsTable records={visible} editable={false} />
        )}
      </section>
    </main>
  );
}
