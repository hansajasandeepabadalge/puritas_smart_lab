import { LabRecord } from "@/utils/types";
import { DesignRecord } from "@/services/dbService";

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeXml(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports rows to a UTF-8 with BOM CSV file so Excel opens special characters properly.
 */
export function exportToCsv<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  baseFilename: string
) {
  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(c.value(row))).join(",")
  );
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${baseFilename}.csv`);
}

/**
 * Exports rows to a SpreadsheetML (.xls) workbook with styled header row and typed cells.
 */
export function exportToExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  baseFilename: string,
  sheetName = "Data"
) {
  const headerCells = columns
    .map(
      (c) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(
          c.header
        )}</Data></Cell>`
    )
    .join("");

  const bodyRows = rows
    .map((row) => {
      const cells = columns
        .map((c) => {
          const v = c.value(row);
          if (typeof v === "number" && Number.isFinite(v)) {
            return `<Cell><Data ss:Type="Number">${v}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${escapeXml(v)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0B5FA5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   <Row>${headerCells}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(blob, `${baseFilename}.xls`);
}

// ─── Domain Exporters ─────────────────────────────────────────────────────────

const LAB_RECORD_COLUMNS: ExportColumn<LabRecord>[] = [
  { header: "Ref No.", value: (r) => r.refNo },
  { header: "Date", value: (r) => r.date },
  { header: "Responsible Person", value: (r) => r.responsiblePerson },
  { header: "Effluent Type", value: (r) => r.effluentType },
  { header: "Project Name", value: (r) => r.projectName },
  { header: "Sample Collection Point", value: (r) => r.samplePoint },
  { header: "COD (mg/L)", value: (r) => r.cod },
  { header: "BOD (mg/L)", value: (r) => r.bod },
  { header: "TSS (mg/L)", value: (r) => r.tss },
  { header: "TDS (mg/L)", value: (r) => r.tds },
  { header: "pH", value: (r) => r.ph },
  { header: "OGT (mg/L)", value: (r) => r.ogt },
];

export function exportLabRecords(
  records: LabRecord[],
  format: "csv" | "excel",
  filterSuffix = ""
) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `laboratory-records${filterSuffix ? `-${filterSuffix}` : ""}-${dateStamp}`;
  if (format === "csv") {
    exportToCsv(records, LAB_RECORD_COLUMNS, filename);
  } else {
    exportToExcel(records, LAB_RECORD_COLUMNS, filename, "Lab Records");
  }
}

interface FlattenedDesignRow {
  projectName: string;
  designValue: string;
  treatmentType: string;
  createdAt: string;
  unitIndex: number | string;
  operation: string;
  retentionTime: string;
  specialComment: string;
}

const DESIGN_COLUMNS: ExportColumn<FlattenedDesignRow>[] = [
  { header: "Project Name", value: (r) => r.projectName },
  { header: "Design Value (Ref No.)", value: (r) => r.designValue },
  { header: "Treatment Type", value: (r) => r.treatmentType },
  { header: "Created Date", value: (r) => r.createdAt },
  { header: "Unit #", value: (r) => r.unitIndex },
  { header: "Unit Operation", value: (r) => r.operation },
  { header: "Retention Time", value: (r) => r.retentionTime },
  { header: "Special Comment", value: (r) => r.specialComment },
];

function flattenDesigns(designs: DesignRecord[]): FlattenedDesignRow[] {
  const rows: FlattenedDesignRow[] = [];
  for (const d of designs) {
    const created = d.createdAt
      ? new Date(d.createdAt).toISOString().slice(0, 10)
      : "";
    if (!d.unitOperations.length) {
      rows.push({
        projectName: d.projectName,
        designValue: d.designValue,
        treatmentType: d.treatmentType,
        createdAt: created,
        unitIndex: "-",
        operation: "-",
        retentionTime: "-",
        specialComment: "-",
      });
    } else {
      d.unitOperations.forEach((u, idx) => {
        rows.push({
          projectName: d.projectName,
          designValue: d.designValue,
          treatmentType: d.treatmentType,
          createdAt: created,
          unitIndex: idx + 1,
          operation: u.operation,
          retentionTime: u.retentionTime || "",
          specialComment: u.specialComment || "",
        });
      });
    }
  }
  return rows;
}

export function exportDesigns(
  designs: DesignRecord[],
  format: "csv" | "excel",
  filterSuffix = ""
) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `treatment-designs${filterSuffix ? `-${filterSuffix}` : ""}-${dateStamp}`;
  const flatRows = flattenDesigns(designs);
  if (format === "csv") {
    exportToCsv(flatRows, DESIGN_COLUMNS, filename);
  } else {
    exportToExcel(flatRows, DESIGN_COLUMNS, filename, "Treatment Designs");
  }
}
