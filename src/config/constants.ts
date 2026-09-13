export const EFFLUENT_TYPES = [
  "Cosmetic",
  "Food",
  "Garment",
  "Paint",
  "Pharmaceutical",
  "Printing",
  "Rubber",
  "Sewage",
] as const;

export const STORAGE_KEY = "puritasSmartLabRecords";
export const SESSION_KEY = "puritasSmartLabSession";

export const DEMO_USERS: Record<
  string,
  { password: string; role: "lab" | "designer" | "admin"; display: string }
> = {
  lab: { password: "lab123", role: "lab", display: "Lab User" },
  designer: { password: "design123", role: "designer", display: "Designer" },
  admin: { password: "admin123", role: "admin", display: "Admin" },
};
