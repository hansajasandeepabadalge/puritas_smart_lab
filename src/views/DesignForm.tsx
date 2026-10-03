"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import SearchableDropdown from "@/components/SearchableDropdown";
import { TREATMENT_TYPES, UNIT_OPERATIONS } from "@/config/constants";
import { useApp } from "@/contexts/AppContext";
import { fetchDesignOptions, insertDesign } from "@/services/dbService";
import { DesignInput } from "@/utils/types";

export default function DesignForm() {
  const { go, showToast } = useApp();
  const [options, setOptions] = useState<{ projects: string[]; references: string[] }>({
    projects: [], references: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [rows, setRows] = useState([0]);
  const nextRowId = useRef(1);
  const submitting = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchDesignOptions()
      .then((result) => { if (!cancelled) setOptions(result); })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadAttempt]);

  const noRecords = !loading && !loadError &&
    (!options.projects.length || !options.references.length);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || loading || loadError || noRecords) return;

    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) ?? "").trim();
    const projectName = get("design-project");
    const designValue = get("design-value");
    const treatmentType = get("treatment-type");
    const unitOperations = rows.map((id) => ({
      operation: get(`operation-${id}`),
      retentionTime: get(`retention-${id}`),
      specialComment: get(`comment-${id}`),
    }));

    if (!options.projects.includes(projectName) || !options.references.includes(designValue) ||
      !TREATMENT_TYPES.includes(treatmentType as DesignInput["treatmentType"]) ||
      unitOperations.some((unit) =>
        !UNIT_OPERATIONS.includes(unit.operation as typeof UNIT_OPERATIONS[number]) || !unit.retentionTime
      )) {
      setSaveError("Select the required dropdown values and enter a retention time for each unit operation.");
      return;
    }

    submitting.current = true;
    setSaving(true);
    setSaveError("");
    try {
      await insertDesign({
        projectName, designValue,
        treatmentType: treatmentType as DesignInput["treatmentType"],
        unitOperations,
      });
      showToast("Design submitted successfully.");
      go("designer-home");
    } catch {
      setSaveError("Unable to save the design. Please try again. Your form entries have been kept.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <div className="hero">
        <div className="hero-text">
          <h1>Add Design</h1>
          <p>Select historical laboratory data and add the unit operations for your treatment design.</p>
        </div>
        <button className="btn btn-ghost" disabled={saving} onClick={() => go("designer-home")}>
          ← Back
        </button>
      </div>

      {loading && <p role="status">Loading projects and reference numbers…</p>}
      {loadError && (
        <div className="card section-card" role="alert">
          <p>Unable to load historical laboratory records.</p>
          <button className="btn btn-secondary" onClick={() => {
            setLoadError(false);
            setLoading(true);
            setLoadAttempt((attempt) => attempt + 1);
          }}>Retry</button>
        </div>
      )}
      {noRecords && <p role="status">Add historical laboratory records before creating a design.</p>}

      <form onSubmit={handleSubmit}>
        <fieldset className="design-fields" disabled={loading || loadError || noRecords || saving}>
          <legend className="sr-only">Treatment design</legend>
          <section className="card section-card">
            <div className="section-title">
              <h2>Design Details</h2>
              <span>Required fields are marked *</span>
            </div>
            <div className="form-grid">
              <SearchableDropdown id="design-project" label="Project Name" options={options.projects} />
              <SearchableDropdown id="design-value" label="Design Value" options={options.references}
                placeholder="Search or select a Ref No" />
              <div className="form-group">
                <label htmlFor="treatment-type" className="required">Treatment Type</label>
                <select id="treatment-type" name="treatment-type" required defaultValue="">
                  <option value="">Select treatment type</option>
                  {TREATMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="card section-card">
            <div className="section-title">
              <h2>Unit Operations</h2>
              <button id="add-unit-operation-btn" className="btn btn-secondary" type="button"
                aria-label="Add unit operation" onClick={() => {
                  const id = nextRowId.current++;
                  setRows((previous) => [...previous, id]);
                }}>
                <span aria-hidden="true">＋</span> Add Unit Operation
              </button>
            </div>
            <div aria-live="polite" className="sr-only">{rows.length} unit operation rows</div>
            {rows.map((id, index) => {
              const number = String(index + 1).padStart(2, "0");
              return (
                <fieldset key={id} className="design-unit">
                  <legend>Unit Operation {number}</legend>
                  <div className="design-unit-grid">
                    <SearchableDropdown id={`operation-${id}`} label={`Unit Operation ${number}`}
                      options={UNIT_OPERATIONS} />
                    <div className="form-group">
                      <label htmlFor={`retention-${id}`} className="required">Retention Time</label>
                      <input id={`retention-${id}`} name={`retention-${id}`} type="text" required
                        placeholder="e.g. 2 hours" />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`comment-${id}`}>Special Comment</label>
                      <input id={`comment-${id}`} name={`comment-${id}`} type="text"
                        placeholder="Optional comment" />
                    </div>
                  </div>
                  {rows.length > 1 && (
                    <div className="button-row">
                      <button type="button" className="btn btn-danger"
                        aria-label={`Remove unit operation ${number}`}
                        onClick={() => setRows((previous) => previous.filter((row) => row !== id))}>
                        Remove
                      </button>
                    </div>
                  )}
                </fieldset>
              );
            })}
            <div className="button-row">
              <button className="btn btn-ghost" type="button" onClick={() => go("designer-home")}>Cancel</button>
              <button id="design-submit-btn" className="btn btn-primary" type="submit">
                {saving ? "Submitting…" : "Submit"}
              </button>
            </div>
          </section>
        </fieldset>
        {saveError && <p role="alert" className="design-error">{saveError}</p>}
      </form>
    </main>
  );
}
