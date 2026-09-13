"use client";

import { FormEvent } from "react";
import { useApp } from "@/contexts/AppContext";
import { EFFLUENT_TYPES } from "@/config/constants";
import {
  generateRefNo,
  getRecords,
  saveRecords,
} from "@/services/storageService";
import { LabRecord } from "@/utils/types";

interface Props {
  record?: LabRecord | null;
  isEdit?: boolean;
}

export default function RecordForm({ record = null, isEdit = false }: Props) {
  const { session, go, showToast } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const defaults = {
    refNo: record?.refNo ?? generateRefNo(),
    date: record?.date ?? today,
    responsiblePerson: record?.responsiblePerson ?? session?.username ?? "",
    effluentType: record?.effluentType ?? "",
    projectName: record?.projectName ?? "",
    samplePoint: record?.samplePoint ?? "",
    cod: record?.cod ?? "",
    bod: record?.bod ?? "",
    tss: record?.tss ?? "",
    tds: record?.tds ?? "",
    ph: record?.ph ?? "",
    ogt: record?.ogt ?? "",
  };

  function collectFormData(form: HTMLFormElement) {
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;
    return {
      refNo: get("refNo").trim(),
      date: get("date"),
      responsiblePerson: get("responsiblePerson").trim(),
      effluentType: get("effluentType"),
      projectName: get("projectName").trim(),
      samplePoint: get("samplePoint").trim(),
      cod: Number(get("cod")),
      bod: Number(get("bod")),
      tss: Number(get("tss")),
      tds: Number(get("tds")),
      ph: Number(get("ph")),
      ogt: Number(get("ogt")),
    };
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = collectFormData(form);
    const records = getRecords();

    if (isEdit && record) {
      // ── Update existing ──
      if (
        records.some(
          (r) =>
            r.id !== record.id &&
            r.refNo.toLowerCase() === data.refNo.toLowerCase()
        )
      ) {
        showToast("Reference number already exists.", true);
        return;
      }
      const idx = records.findIndex((r) => r.id === record.id);
      if (idx < 0) {
        showToast("Record not found.", true);
        return;
      }
      records[idx] = {
        ...records[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveRecords(records);
      showToast("Laboratory data updated successfully.");
      setTimeout(() => go("edit-list"), 500);
    } else {
      // ── Insert new ──
      if (
        records.some((r) => r.refNo.toLowerCase() === data.refNo.toLowerCase())
      ) {
        showToast("Reference number already exists.", true);
        return;
      }
      const now = new Date().toISOString();
      records.unshift({
        id: crypto.randomUUID(),
        ...data,
        effluentType: data.effluentType as LabRecord["effluentType"],
        createdAt: now,
        updatedAt: now,
      });
      saveRecords(records);
      showToast("Laboratory data saved successfully.");
      setTimeout(() => go("edit-list"), 500);
    }
  }

  return (
    <main className="page">
      <div className="hero">
        <button
          className="btn btn-ghost"
          onClick={() => go(isEdit ? "edit-list" : "lab-home")}
        >
          ← Back
        </button>
        <h1>{isEdit ? "Edit Laboratory Data" : "Insert New Data"}</h1>
        <p>
          {isEdit
            ? "Update the selected laboratory record."
            : "Enter laboratory reference information and wastewater test results."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Reference Info ── */}
        <section className="card section-card">
          <div className="section-title">
            <h2>Reference Information</h2>
            <span>Required fields are marked *</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="refNo" className="required">Ref No.</label>
              <input
                id="refNo"
                name="refNo"
                required
                defaultValue={defaults.refNo}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date" className="required">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={defaults.date}
              />
            </div>
            <div className="form-group">
              <label htmlFor="responsiblePerson" className="required">
                Responsible Person (Username)
              </label>
              <input
                id="responsiblePerson"
                name="responsiblePerson"
                required
                defaultValue={defaults.responsiblePerson}
                readOnly
              />
              <span className="helper">
                Automatically filled from the logged-in user.
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="effluentType" className="required">
                Effluent Type
              </label>
              <select
                id="effluentType"
                name="effluentType"
                required
                defaultValue={defaults.effluentType}
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
              <label htmlFor="projectName" className="required">
                Project Name
              </label>
              <input
                id="projectName"
                name="projectName"
                required
                defaultValue={defaults.projectName}
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="samplePoint" className="required">
                Sample Collection Point
              </label>
              <input
                id="samplePoint"
                name="samplePoint"
                required
                defaultValue={defaults.samplePoint}
                placeholder="Enter collection point"
              />
            </div>
          </div>
        </section>

        {/* ── Test Results ── */}
        <section className="card section-card">
          <div className="section-title">
            <h2>Test Results</h2>
            <span>Enter measured laboratory values</span>
          </div>
          <div className="test-grid">
            {(
              [
                { label: "COD", name: "cod", step: "any" },
                { label: "BOD", name: "bod", step: "any" },
                { label: "TSS", name: "tss", step: "any" },
                { label: "TDS", name: "tds", step: "any" },
                { label: "pH", name: "ph", step: "0.01" },
                { label: "OGT", name: "ogt", step: "any" },
              ] as const
            ).map(({ label, name, step }) => (
              <div className="form-group" key={name}>
                <label htmlFor={name} className="required">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type="number"
                  step={step}
                  min="0"
                  required
                  defaultValue={String(defaults[name])}
                  placeholder={`Enter ${label} value`}
                />
              </div>
            ))}
          </div>

          <div className="button-row">
            <button
              id="form-submit-btn"
              className="btn btn-primary"
              type="submit"
            >
              {isEdit ? "Update Data" : "Save Data"}
            </button>
            {!isEdit && (
              <button
                id="form-clear-btn"
                className="btn btn-secondary"
                type="reset"
              >
                Clear Form
              </button>
            )}
            <button
              id="form-cancel-btn"
              className="btn btn-ghost"
              type="button"
              onClick={() => go(isEdit ? "edit-list" : "lab-home")}
            >
              Cancel
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
