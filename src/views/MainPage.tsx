"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { DesignRecord, fetchDesigns, fetchRecords, formatNumber } from "@/services/dbService";
import { LabRecord } from "@/utils/types";
import { EFFLUENT_TYPES } from "@/config/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar03Icon,
  FolderOpenIcon,
  Layers01Icon,
  RulerIcon,
  Task01Icon,
} from "@hugeicons/core-free-icons";

export default function MainPage() {
  const { session, go, showToast } = useApp();
  const canLab = session?.role === "lab" || session?.role === "admin";
  const [records, setRecords] = useState<LabRecord[]>([]);
  const [designs, setDesigns] = useState<DesignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paramEffluent, setParamEffluent] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetchRecords().catch(() => [] as LabRecord[]),
      fetchDesigns().catch(() => [] as DesignRecord[]),
    ])
      .then(([r, d]) => {
        setRecords(r);
        setDesigns(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = records.filter((r) => {
      const d = new Date(r.createdAt || r.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
    const byType: Record<string, number> = {};
    records.forEach((r) => {
      const k = r.effluentType || "Unspecified";
      byType[k] = (byType[k] ?? 0) + 1;
    });
    return {
      total: records.length,
      projects: new Set(records.map((r) => r.projectName).filter(Boolean)).size,
      types: Object.keys(byType).length,
      thisMonth,
      byType: Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 6),
    };
  }, [records]);

  const paramStats = useMemo(() => {
    const subset = paramEffluent
      ? records.filter((r) => r.effluentType === paramEffluent)
      : records;

    const calc = (key: keyof LabRecord) => {
      const vals = subset
        .map((r) => Number(r[key]))
        .filter((n) => Number.isFinite(n) && n >= 0);
      if (!vals.length) return { avg: 0, min: 0, max: 0, count: 0 };
      const sum = vals.reduce((a, b) => a + b, 0);
      return {
        avg: sum / vals.length,
        min: Math.min(...vals),
        max: Math.max(...vals),
        count: vals.length,
      };
    };

    const cod = calc("cod");
    const bod = calc("bod");
    const ratio = cod.avg > 0 ? bod.avg / cod.avg : 0;
    const outOfRangePh = subset.filter((r) => {
      const ph = Number(r.ph);
      return Number.isFinite(ph) && (ph < 6.5 || ph > 8.5);
    }).length;

    return {
      count: subset.length,
      ratio,
      outOfRangePh,
      metrics: [
        { key: "COD", unit: "mg/L", ...cod },
        { key: "BOD", unit: "mg/L", ...bod },
        { key: "TSS", unit: "mg/L", ...calc("tss") },
        { key: "TDS", unit: "mg/L", ...calc("tds") },
        { key: "pH", unit: "pH", ...calc("ph") },
        { key: "OGT", unit: "mg/L", ...calc("ogt") },
      ],
    };
  }, [records, paramEffluent]);

  const v = (n: number) => (loading ? "—" : n.toLocaleString());

  const actions = [
    {
      icon: <HugeiconsIcon icon={Add01Icon} size={24} />,
      title: "Insert New Data",
      desc: "Create a new laboratory record.",
      onClick: () => go("insert"),
      lab: true,
    },
    {
      icon: <HugeiconsIcon icon={RulerIcon} size={22} />,
      title: "Add Design",
      desc: "Build a treatment design.",
      onClick: () => go("add-design"),
    },
  ];

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <span className="badge">Laboratory Data Management</span>
          <h1>Welcome back, {session?.display || session?.username}</h1>
          <p>Here&apos;s an overview of your laboratory records, water quality metrics, and treatment designs.</p>
        </div>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="stat-row">
        {[
          {
            label: "Total Records",
            value: stats.total,
            icon: <HugeiconsIcon icon={Task01Icon} size={24} />,
          },
          {
            label: "Projects",
            value: stats.projects,
            icon: <HugeiconsIcon icon={FolderOpenIcon} size={24} />,
          },
          {
            label: "Saved Designs",
            value: designs.length,
            icon: <HugeiconsIcon icon={Layers01Icon} size={24} />,
          },
          {
            label: "Added This Month",
            value: stats.thisMonth,
            icon: <HugeiconsIcon icon={Calendar03Icon} size={24} />,
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card stat-card">
            <div className="stat-icon">{icon}</div>
            <div>
              <div className="value">{v(value)}</div>
              <div className="label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="section-title">
        <h2>Quick Actions</h2>
      </div>
      <div className="action-grid">
        {actions.map((a) => {
          const disabled = a.lab && !canLab;
          return (
            <button
              key={a.title}
              className="card action-card"
              disabled={disabled}
              onClick={() =>
                disabled
                  ? showToast("Your account does not have Lab User permission.", true)
                  : a.onClick()
              }
            >
              <div className="module-icon" aria-hidden="true">{a.icon}</div>
              <div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Water Quality Parameter Benchmarks ── */}
      {/* <div className="card section-card">
        <div className="section-title" style={{ flexWrap: "wrap" }}>
          <div>
            <h2>Water Quality Parameter Summary</h2>
            <span>
              {loading
                ? "Calculating averages…"
                : `Based on ${paramStats.count} sample(s) · Avg BOD/COD Ratio: ${paramStats.ratio.toFixed(2)} · pH outside 6.5–8.5: ${paramStats.outOfRangePh}`}
            </span>
          </div>
          <div style={{ minWidth: 220 }}>
            <select
              aria-label="Filter parameter summary by effluent type"
              value={paramEffluent}
              onChange={(e) => setParamEffluent(e.target.value)}
            >
              <option value="">All Effluent Types</option>
              {EFFLUENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="param-grid">
          {paramStats.metrics.map((m) => (
            <div key={m.key} className="param-card">
              <div className="param-header">
                <strong>{m.key}</strong>
                <span>{m.unit}</span>
              </div>
              <div className="param-avg">
                {loading || !m.count
                  ? "—"
                  : m.key === "pH"
                    ? m.avg.toFixed(2)
                    : formatNumber(Math.round(m.avg))}
              </div>
              <div className="param-range">
                <span>
                  Min:{" "}
                  {loading || !m.count
                    ? "—"
                    : m.key === "pH"
                      ? m.min.toFixed(1)
                      : formatNumber(Math.round(m.min))}
                </span>
                <span>
                  Max:{" "}
                  {loading || !m.count
                    ? "—"
                    : m.key === "pH"
                      ? m.max.toFixed(1)
                      : formatNumber(Math.round(m.max))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* ── Records & Effluent Distribution ── */}
      <div className="dashboard-grid">
        <div className="card section-card">
          <div className="section-title">
            <h2>Recent Laboratory Records</h2>
            {canLab && (
              <button className="btn btn-secondary" onClick={() => go("edit-list")}>
                View all
              </button>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Effluent</th>
                  <th>COD</th>
                  <th>BOD</th>
                  <th>pH</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td>{r.refNo}</td>
                    <td>{r.date}</td>
                    <td>{r.projectName}</td>
                    <td>{r.effluentType}</td>
                    <td>{formatNumber(r.cod)}</td>
                    <td>{formatNumber(r.bod)}</td>
                    <td>{formatNumber(r.ph)}</td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {loading ? "Loading…" : "No records yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card section-card">
          <div className="section-title">
            <h2>Records by Effluent Type</h2>
          </div>
          {stats.byType.length ? (
            <div className="bar-list">
              {stats.byType.map(([type, count]) => (
                <div key={type} className="bar-item">
                  <div className="bar-label">
                    <span>{type}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">{loading ? "Loading…" : "No data."}</div>
          )}
        </div>
      </div>


    </main>
  );
}
