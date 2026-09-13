import { EFFLUENT_TYPES } from "@/config/constants";

export type EffluentType = (typeof EFFLUENT_TYPES)[number];

export type Role = "lab" | "designer" | "admin";

export type Route =
  | "login"
  | "main"
  | "lab-home"
  | "insert"
  | "edit-list"
  | "edit-form"
  | "designer";

export interface Session {
  username: string;
  role: Role;
  display: string;
}

export interface LabRecord {
  id: string;
  refNo: string;
  date: string;
  responsiblePerson: string;
  effluentType: EffluentType | string;
  projectName: string;
  samplePoint: string;
  cod: number;
  bod: number;
  tss: number;
  tds: number;
  ph: number;
  ogt: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  route: Route;
  editingId: string | null;
  filters: Partial<{
    refNo: string;
    projectName: string;
    effluentType: string;
    date: string;
  }>;
  designerEffluent: string;
  designerProject: string;
}
