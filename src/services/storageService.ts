import { SESSION_KEY, STORAGE_KEY } from "@/config/constants";
import { LabRecord, Session } from "@/utils/types";

const SEED_RECORDS: LabRecord[] = [
  {
    id: "seed-001",
    refNo: "PSL-2026-0001",
    date: "2026-09-01",
    responsiblePerson: "lab",
    effluentType: "Food",
    projectName: "Food Processing Plant A",
    samplePoint: "Equalization Tank Outlet",
    cod: 1850,
    bod: 880,
    tss: 410,
    tds: 2100,
    ph: 6.8,
    ogt: 95,
    createdAt: "2026-09-01T09:15:00",
    updatedAt: "2026-09-01T09:15:00",
  },
  {
    id: "seed-002",
    refNo: "PSL-2026-0002",
    date: "2026-09-04",
    responsiblePerson: "lab",
    effluentType: "Food",
    projectName: "Food Processing Plant A",
    samplePoint: "Raw Effluent Collection",
    cod: 2120,
    bod: 1010,
    tss: 490,
    tds: 2280,
    ph: 6.5,
    ogt: 120,
    createdAt: "2026-09-04T11:20:00",
    updatedAt: "2026-09-04T11:20:00",
  },
  {
    id: "seed-003",
    refNo: "PSL-2026-0003",
    date: "2026-09-07",
    responsiblePerson: "lab",
    effluentType: "Sewage",
    projectName: "Residential Development B",
    samplePoint: "Inlet Chamber",
    cod: 540,
    bod: 280,
    tss: 260,
    tds: 720,
    ph: 7.2,
    ogt: 18,
    createdAt: "2026-09-07T14:00:00",
    updatedAt: "2026-09-07T14:00:00",
  },
];

// ─── Session ──────────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Records ──────────────────────────────────────────────────────────────────

export function getRecords(): LabRecord[] {
  if (typeof window === "undefined") return SEED_RECORDS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as LabRecord[];
    saveRecords(SEED_RECORDS);
    return SEED_RECORDS;
  } catch {
    return SEED_RECORDS;
  }
}

export function saveRecords(records: LabRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ─── Ref No Generator ─────────────────────────────────────────────────────────

export function generateRefNo(): string {
  const year = new Date().getFullYear();
  const records = getRecords();
  const max = records
    .map((r) => r.refNo)
    .filter(Boolean)
    .map((r) => Number((r.match(/(\d{4})$/) || [])[1] || 0))
    .reduce((a, b) => Math.max(a, b), 0);
  return `PSL-${year}-${String(max + 1).padStart(4, "0")}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatNumber(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : "-";
}
