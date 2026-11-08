"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { deleteDesign, DesignRecord, fetchDesigns } from "@/services/dbService";
import Pagination, { usePagination } from "@/components/Pagination";
import { exportDesigns } from "@/utils/exportUtils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Csv02Icon, Delete02Icon, Xls02Icon } from "@hugeicons/core-free-icons";

export default function DesignsPage() {
  const { go, showToast } = useApp();
  const [designs, setDesigns] = useState<DesignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [treatment, setTreatment] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDesigns()
      .then(setDesigns)
      .catch(() => showToast("Could not load designs.", true))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return designs.filter(
      (d) =>
        (!treatment || d.treatmentType === treatment) &&
        (!q ||
          d.projectName.toLowerCase().includes(q) ||
          d.designValue.toLowerCase().includes(q))
    );
  }, [designs, search, treatment]);
  const pager = usePagination(filtered);

  function handleExport(format: "csv" | "excel") {
    const activeFilters = [treatment, search.trim()]
      .filter(Boolean)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    exportDesigns(filtered, format, activeFilters);
  }

  async function handleDelete(design: DesignRecord) {
    if (
      !window.confirm(
        `Are you sure you want to delete the design for "${design.projectName}" (${design.designValue})?`
      )
    ) {
      return;
    }
    setDeletingId(design.id);
    try {
      await deleteDesign(design.id);
      setDesigns((prev) => prev.filter((d) => d.id !== design.id));
      if (expanded === design.id) setExpanded(null);
      showToast("Design deleted.");
    } catch {
      showToast("Failed to delete design. Please check permissions.", true);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <h1>Designs</h1>
          <p>Browse saved treatment designs and their unit operations.</p>
        </div>
        <div className="hero-actions">
          <button
            id="designer-add-btn"
            className="btn btn-primary"
            onClick={() => go("add-design")}
          >
            <HugeiconsIcon icon={Add01Icon} size={18} /> Add Design
          </button>
        </div>
      </div>

      <section className="card section-card">
        <div className="section-title">
          <h2>Search &amp; Filters</h2>
        </div>
        <div className="filter-grid designer">
          <div className="form-group">
            <label htmlFor="designSearch">Project / Design Value</label>
            <input
              id="designSearch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designs"
            />
          </div>
          <div className="form-group">
            <label htmlFor="designTreatment">Treatment Type</label>
            <select
              id="designTreatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            >
              <option value="">All</option>
              <option value="Biological">Biological</option>
              <option value="Chemical">Chemical</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setTreatment("");
            }}
          >
            Clear
          </button>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-title" style={{ flexWrap: "wrap" }}>
          <div>
            <h2>Saved Designs</h2>
            <span>{loading ? "Loading…" : `${filtered.length} design(s)`}</span>
          </div>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={loading || !filtered.length}
              onClick={() => handleExport("csv")}
            >
              <HugeiconsIcon icon={Csv02Icon} size={18} /> Export CSV
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading || !filtered.length}
              onClick={() => handleExport("excel")}
            >
              <HugeiconsIcon icon={Xls02Icon} size={18} /> Export Excel
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Design Value</th>
                <th>Treatment</th>
                <th>Unit Operations</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pager.slice.map((d) => (
                <Fragment key={d.id}>
                  <tr>
                    <td>{d.projectName}</td>
                    <td>{d.designValue}</td>
                    <td>
                      <span className="badge">{d.treatmentType}</span>
                    </td>
                    <td>{d.unitOperations.length}</td>
                    <td>
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td>
                      <div className="hero-actions">
                        <button
                          className="btn btn-ghost"
                          onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                        >
                          {expanded === d.id ? "Hide" : "View"}
                        </button>
                        <button
                          className="btn btn-danger"
                          disabled={deletingId === d.id}
                          onClick={() => handleDelete(d)}
                          aria-label={`Delete design for ${d.projectName}`}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />{" "}
                          {deletingId === d.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === d.id && (
                    <tr>
                      <td colSpan={6} style={{ background: "#f8fbfd" }}>
                        {d.unitOperations.length ? (
                          <table>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Operation</th>
                                <th>Retention Time</th>
                                <th>Special Comment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {d.unitOperations.map((u, i) => (
                                <tr key={i}>
                                  <td>{i + 1}</td>
                                  <td>{u.operation}</td>
                                  <td>{u.retentionTime || "-"}</td>
                                  <td style={{ whiteSpace: "normal" }}>
                                    {u.specialComment || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          "No unit operations."
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    {loading ? "Loading designs…" : "No designs found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination {...pager} />
        </div>
      </section>
    </main>
  );
}
