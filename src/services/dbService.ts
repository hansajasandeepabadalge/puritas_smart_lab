import { supabase } from "@/lib/supabase";
import { LabRecord } from "@/utils/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecordFilters {
  refNo?: string;
  projectName?: string;
  effluentType?: string;
  date?: string;
}

// ─── Records ──────────────────────────────────────────────────────────────────

function rowToRecord(row: Record<string, unknown>): LabRecord {
  return {
    id: row.id as string,
    refNo: row.ref_no as string,
    date: row.date as string,
    responsiblePerson: row.responsible_person as string,
    effluentType: row.effluent_type as string,
    projectName: row.project_name as string,
    samplePoint: row.sample_point as string,
    cod: Number(row.cod),
    bod: Number(row.bod),
    tss: Number(row.tss),
    tds: Number(row.tds),
    ph: Number(row.ph),
    ogt: Number(row.ogt),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchRecords(
  filters: RecordFilters = {}
): Promise<LabRecord[]> {
  let query = supabase
    .from("lab_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.effluentType) {
    query = query.eq("effluent_type", filters.effluentType);
  }
  if (filters.date) {
    query = query.eq("date", filters.date);
  }
  if (filters.refNo) {
    query = query.ilike("ref_no", `%${filters.refNo}%`);
  }
  if (filters.projectName) {
    query = query.ilike("project_name", `%${filters.projectName}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToRecord);
}

export async function fetchRecordById(
  id: string
): Promise<LabRecord | null> {
  const { data, error } = await supabase
    .from("lab_records")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToRecord(data);
}

export async function insertRecord(
  payload: Omit<LabRecord, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const { error } = await supabase.from("lab_records").insert({
    ref_no: payload.refNo,
    date: payload.date,
    responsible_person: payload.responsiblePerson,
    effluent_type: payload.effluentType,
    project_name: payload.projectName,
    sample_point: payload.samplePoint,
    cod: payload.cod,
    bod: payload.bod,
    tss: payload.tss,
    tds: payload.tds,
    ph: payload.ph,
    ogt: payload.ogt,
  });
  if (error) throw error;
}

export async function updateRecord(
  id: string,
  payload: Omit<LabRecord, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const { error } = await supabase
    .from("lab_records")
    .update({
      ref_no: payload.refNo,
      date: payload.date,
      responsible_person: payload.responsiblePerson,
      effluent_type: payload.effluentType,
      project_name: payload.projectName,
      sample_point: payload.samplePoint,
      cod: payload.cod,
      bod: payload.bod,
      tss: payload.tss,
      tds: payload.tds,
      ph: payload.ph,
      ogt: payload.ogt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function refNoExists(
  refNo: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("lab_records")
    .select("id")
    .ilike("ref_no", refNo);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

export async function generateRefNo(): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await supabase
    .from("lab_records")
    .select("ref_no")
    .like("ref_no", `PSL-${year}-%`)
    .order("ref_no", { ascending: false })
    .limit(1);

  const last = data?.[0]?.ref_no ?? "";
  const lastNum = Number((last.match(/(\d{4})$/) || [])[1] ?? 0);
  return `PSL-${year}-${String(lastNum + 1).padStart(4, "0")}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatNumber(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : "-";
}
