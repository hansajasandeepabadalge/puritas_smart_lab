"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { EFFLUENT_TYPES } from "@/config/constants";
import { fetchRecords } from "@/services/dbService";
import RecordsTable from "@/components/RecordsTable";
import { LabRecord } from "@/utils/types";

export default function EditListPage() {
  const { state, go, setFilters } = useApp();
  const [localRef, setLocalRef] = useState(state.filters.refNo ?? "");
  const [localProject, setLocalProject] = useState(state.filters.projectName ?? "");
  const [localEffluent, setLocalEffluent] = useState(state.filters.effluentType ?? "");
  const [localDate, setLocalDate] = useState(state.filters.date ?? "");

  const [records, setRecords] = useState<LabRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const f = state.filters;

  useEffect(() => {
    setLoading(true);
    fetchRecords({
      refNo: f.refNo,
      projectName: f.projectName,
      effluentType: f.effluentType,
      date: f.date,
    })
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [f.refNo, f.projectName, f.effluentType, f.date]);

  function applyFilters() {
    setFilters({
      refNo: localRef,
      projectName: localProject,
      effluentType: localEffluent,
      date: localDate,
    });
  }

  function resetFilters() {
    setLocalRef("");
    setLocalProject("");
    setLocalEffluent("");
    setLocalDate("");
    setFilters({});
  }

  function handleEdit(id: string) {
    go("edit-form", { editingId: id });
  }

  return (
    <main className="page">
      <div className="hero">
        <button id="edit-list-back-btn" className="btn btn-ghost" onClick={() => go("lab-home")}>
          ← Back
        </button>
        <h1>Edit Existing Data</h1>
        <p>Search laboratory records and open a record to modify its values.</p>
      </div>

      {/* ── Filters ── */}
      <section className="card section-card">
        <div className="section-title">
          <h2>Search &amp; Filters</h2>
        </div>
        <div className="filter-grid">
          <div className="form-group">
            <label htmlFor="filterRef">Ref No.</label>
            <input
              id="filterRef"
              value={localRef}
              onChange={(e) => setLocalRef(e.target.value)}
              placeholder="e.g. PSL-2026-0001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterProject">Project Name</label>
            <input
              id="filterProject"
              value={localProject}
              onChange={(e) => setLocalProject(e.target.value)}
              placeholder="Search project"
            />
          </div>
          <div className="form-group">
            <label htmlFor="filterEffluent">Effluent Type</label>
            <select
              id="filterEffluent"
              value={localEffluent}
              onChange={(e) => setLocalEffluent(e.target.value)}
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
            <label htmlFor="filterDate">Date</label>
            <input
              id="filterDate"
              type="date"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
            />
          </div>
        </div>
        <div className="button-row">
          <button id="edit-search-btn" className="btn btn-primary" onClick={applyFilters}>
            Search
          </button>
          <button id="edit-clear-btn" className="btn btn-secondary" onClick={resetFilters}>
            Clear Filters
          </button>
          <button id="edit-new-btn" className="btn btn-ghost" onClick={() => go("insert")}>
            + New Record
          </button>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="card section-card">
        <div className="section-title">
          <h2>Matching Records</h2>
          <span>{loading ? "Loading…" : `${records.length} record(s)`}</span>
        </div>
        {loading ? (
          <div className="empty-state">Loading records…</div>
        ) : (
          <RecordsTable records={records} editable onEdit={handleEdit} />
        )}
      </section>
    </main>
  );
}
