"use client";

import { FormEvent, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { EFFLUENT_TYPES } from "@/config/constants";
import {
  generateRefNo,
  insertRecord,
  refNoExists,
  updateRecord,
} from "@/services/dbService";
import { LabRecord } from "@/utils/types";

interface Props {
  record?: LabRecord | null;
  isEdit?: boolean;
  onSaved?: () => void;
}

export default function RecordForm({ record = null, isEdit = false, onSaved }: Props) {
  const { session, go, showToast } = useApp();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = collectFormData(form);
    setSaving(true);

    try {
      if (isEdit && record) {
        // ── Update existing ──
        const duplicate = await refNoExists(data.refNo, record.id);
        if (duplicate) {
          showToast("Reference number already exists.", true);
          return;
        }
        await updateRecord(record.id, {
          ...data,
          effluentType: data.effluentType as LabRecord["effluentType"],
        });
        showToast("Laboratory data updated successfully.");
        setTimeout(() => {
          onSaved?.();
          go("edit-list");
        }, 500);
      } else {
        // ── Insert new ──
        const duplicate = await refNoExists(data.refNo);
        if (duplicate) {
          showToast("Reference number already exists.", true);
          return;
        }
        await insertRecord({
          ...data,
          effluentType: data.effluentType as LabRecord["effluentType"],
        });
        showToast("Laboratory data saved successfully.");
        setTimeout(() => {
          onSaved?.();
          go("edit-list");
        }, 500);
      }
    } catch {
      showToast("An error occurred. Please try again.", true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <h1>{isEdit ? "Edit Laboratory Data" : "Insert New Data"}</h1>
          <p>
            {isEdit
              ? "Update the selected laboratory record."
              : "Enter laboratory reference information and wastewater test results."}
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => go(isEdit ? "edit-list" : "lab-home")}
        >
          ← Back
        </button>
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
              <RefNoInput defaultValue={record?.refNo} isEdit={isEdit} />
            </div>
            <div className="form-group">
              <label htmlFor="date" className="required">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={record?.date ?? today}
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
                defaultValue={record?.responsiblePerson ?? session?.username ?? ""}
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
                defaultValue={record?.effluentType ?? ""}
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
                defaultValue={record?.projectName ?? ""}
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
                defaultValue={record?.samplePoint ?? ""}
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
                  defaultValue={record ? String(record[name]) : ""}
                  placeholder={`Enter ${label} value`}
                />
              </div>
            ))}
          </div>

          <div className="button-row">
            <button
              id="form-cancel-btn"
              className="btn btn-ghost"
              type="button"
              onClick={() => go(isEdit ? "edit-list" : "lab-home")}
            >
              Cancel
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
              id="form-submit-btn"
              className="btn btn-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update Data" : "Save Data"}
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}

// ── Auto-generates refNo for new records ──────────────────────────────────────

function RefNoInput({
  defaultValue,
  isEdit,
}: {
  defaultValue?: string;
  isEdit: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [generated, setGenerated] = useState(false);

  // Auto-generate on mount for new records
  if (!isEdit && !generated && !defaultValue) {
    setGenerated(true);
    generateRefNo().then(setValue);
  }

  return (
    <input
      id="refNo"
      name="refNo"
      required
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
