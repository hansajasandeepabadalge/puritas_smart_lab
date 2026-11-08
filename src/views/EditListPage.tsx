"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { EFFLUENT_TYPES } from "@/config/constants";
import { deleteRecord, fetchRecords } from "@/services/dbService";
import RecordsTable from "@/components/RecordsTable";
import { LabRecord } from "@/utils/types";
import { exportLabRecords } from "@/utils/exportUtils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Csv02Icon, Xls02Icon } from "@hugeicons/core-free-icons";

export default function EditListPage() {
  const { state, go, setFilters, showToast } = useApp();
  const [localRef, setLocalRef] = useState(state.filters.refNo ?? "");
  const [localProject, setLocalProject] = useState(state.filters.projectName ?? "");
  const [localEffluent, setLocalEffluent] = useState(state.filters.effluentType ?? "");
  const [localDate, setLocalDate] = useState(state.filters.date ?? "");

  const [records, setRecords] = useState<LabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(record: LabRecord) {
    if (
      !window.confirm(
        `Are you sure you want to delete laboratory record "${record.refNo}" (${record.projectName})?`
      )
    ) {
      return;
    }
    setDeletingId(record.id);
    try {
      await deleteRecord(record.id);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      showToast(`Record ${record.refNo} deleted.`);
    } catch {
      showToast("Failed to delete record. Please check permissions.", true);
    } finally {
      setDeletingId(null);
    }
  }

  function handleExport(format: "csv" | "excel") {
    const activeFilters = [f.effluentType, f.projectName, f.refNo, f.date]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    exportLabRecords(records, format, activeFilters);
  }

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <h1>Laboratory Records</h1>
          <p>Search laboratory records, open a record to modify its values, or add a new one.</p>
        </div>
        <button id="lab-insert-btn" className="btn btn-primary" onClick={() => go("insert")}>
          <HugeiconsIcon icon={Add01Icon} size={18} /> Insert New Data
        </button>
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
          <button id="edit-clear-btn" className="btn btn-secondary" onClick={resetFilters}>
            Clear Filters
          </button>
          <button id="edit-search-btn" className="btn btn-primary" onClick={applyFilters}>
            Search
          </button>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="card section-card">
        <div className="section-title" style={{ flexWrap: "wrap" }}>
          <div>
            <h2>Matching Records</h2>
            <span>{loading ? "Loading…" : `${records.length} record(s)`}</span>
          </div>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={loading || !records.length}
              onClick={() => handleExport("csv")}
            >
              <HugeiconsIcon icon={Csv02Icon} size={18} /> Export CSV
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading || !records.length}
              onClick={() => handleExport("excel")}
            >
              <HugeiconsIcon icon={Xls02Icon} size={18} /> Export Excel
            </button>
          </div>
        </div>
        {loading ? (
          <div className="empty-state">Loading records…</div>
        ) : (
          <RecordsTable
            records={records}
            editable
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </section>
    </main>
  );
}
