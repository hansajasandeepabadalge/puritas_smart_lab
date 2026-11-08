"use client";

import { LabRecord } from "@/utils/types";
import { formatNumber } from "@/services/dbService";
import Pagination, { usePagination } from "@/components/Pagination";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";

interface Props {
  records: LabRecord[];
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (record: LabRecord) => void;
  deletingId?: string | null;
}

export default function RecordsTable({
  records,
  editable = false,
  onEdit,
  onDelete,
  deletingId,
}: Props) {
  const pager = usePagination(records);

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
          {pager.slice.map((r) => (
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
                  <div className="hero-actions">
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => onEdit?.(r.id)}
                      aria-label={`Edit record ${r.refNo}`}
                      title="Edit"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                    </button>
                    {onDelete && (
                      <button
                        className="btn btn-danger btn-icon"
                        disabled={deletingId === r.id}
                        onClick={() => onDelete(r)}
                        aria-label={`Delete record ${r.refNo}`}
                        title="Delete"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={18} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination {...pager} />
    </div>
  );
}
