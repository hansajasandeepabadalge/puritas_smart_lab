"use client";

import { LabRecord } from "@/utils/types";
import { formatNumber } from "@/services/storageService";

interface Props {
  records: LabRecord[];
  editable?: boolean;
  onEdit?: (id: string) => void;
}

export default function RecordsTable({ records, editable = false, onEdit }: Props) {
  if (!records.length) {
    return (
      <div className="empty-state">
        No laboratory records found for the selected criteria.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ref No.</th>
            <th>Date</th>
            {editable && <th>Responsible Person</th>}
            <th>Effluent Type</th>
            <th>Project Name</th>
            <th>Sample Collection Point</th>
            <th>COD</th>
            <th>BOD</th>
            <th>TSS</th>
            <th>TDS</th>
            <th>pH</th>
            <th>OGT</th>
            {editable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.refNo}</td>
              <td>{r.date}</td>
              {editable && <td>{r.responsiblePerson}</td>}
              <td>{r.effluentType}</td>
              <td>{r.projectName}</td>
              <td>{r.samplePoint}</td>
              <td>{formatNumber(r.cod)}</td>
              <td>{formatNumber(r.bod)}</td>
              <td>{formatNumber(r.tss)}</td>
              <td>{formatNumber(r.tds)}</td>
              <td>{formatNumber(r.ph)}</td>
              <td>{formatNumber(r.ogt)}</td>
              {editable && (
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEdit?.(r.id)}
                    aria-label={`Edit record ${r.refNo}`}
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
