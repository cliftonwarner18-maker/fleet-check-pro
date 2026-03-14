import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Eye, Wrench, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DefectBadge from "./DefectBadge";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-blue-100 text-blue-800", icon: Eye },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
};

export default function InspectionCard({ inspection, onView, onUpdateStatus, onEdit, onDelete }) {
  const statusCfg = STATUS_CONFIG[inspection.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const allDefects = [...(inspection.defects || []), ...(inspection.air_brake_checks || [])];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">Bus #{inspection.bus_number}</h3>
            <Badge className={cn("text-xs", statusCfg.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {inspection.driver_name} • {format(new Date(inspection.created_date), "MMM d, yyyy • h:mm a")}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {inspection.inspection_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"}
        </Badge>
      </div>

      {inspection.is_satisfactory ? (
        <div className="bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Vehicle Satisfactory
        </div>
      ) : (
        <>
          {allDefects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {allDefects.map((d) => <DefectBadge key={d} defectId={d} />)}
            </div>
          )}
          {inspection.concerns && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-3">
              {inspection.concerns}
            </p>
          )}
          {inspection.post_trip_concerns && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-3">
              {inspection.post_trip_concerns}
            </p>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={() => onView(inspection)} className="rounded-lg text-xs">
          <Eye className="w-3.5 h-3.5 mr-1" /> View
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(inspection)} className="rounded-lg text-xs">
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
        {inspection.status === "pending" && (
          <Button
            size="sm"
            onClick={() => onUpdateStatus(inspection.id, "reviewed")}
            className="rounded-lg text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Wrench className="w-3.5 h-3.5 mr-1" /> Reviewed
          </Button>
        )}
        {inspection.status === "reviewed" && (
          <Button
            size="sm"
            onClick={() => onUpdateStatus(inspection.id, "resolved")}
            className="rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolved
          </Button>
        )}
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(inspection.id)}
          className="rounded-lg text-xs ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
}