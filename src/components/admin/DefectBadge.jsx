import React from "react";
import { DEFECT_LABEL_MAP } from "@/components/inspection/ChecklistData";
import { Badge } from "@/components/ui/badge";

export default function DefectBadge({ defectId }) {
  const label = DEFECT_LABEL_MAP[defectId] || defectId;
  return (
    <Badge variant="destructive" className="text-xs font-medium">
      {label}
    </Badge>
  );
}