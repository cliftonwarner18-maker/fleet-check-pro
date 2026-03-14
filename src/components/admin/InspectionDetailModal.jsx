import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import DefectBadge from "./DefectBadge";

export default function InspectionDetailModal({ inspection, open, onClose }) {
  const [adminNotes, setAdminNotes] = useState(inspection?.admin_notes || "");
  const queryClient = useQueryClient();

  if (!inspection) return null;

  const allDefects = [...(inspection.defects || []), ...(inspection.air_brake_checks || [])];

  const saveNotes = async () => {
    await base44.entities.Inspection.update(inspection.id, { admin_notes: adminNotes });
    toast.success("Admin notes saved");
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Bus #{inspection.bus_number} — {inspection.inspection_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Driver</p>
              <p className="font-semibold">{inspection.driver_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Date/Time</p>
              <p className="font-semibold">{format(new Date(inspection.created_date), "MMM d, yyyy h:mm a")}</p>
            </div>
            <div>
              <p className="text-slate-500">Route(s)</p>
              <p className="font-semibold">{inspection.route_numbers || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">Bus Type</p>
              <p className="font-semibold capitalize">{inspection.bus_type || "Regular"}</p>
            </div>
            {inspection.odometer_start && (
              <div>
                <p className="text-slate-500">Odometer Start</p>
                <p className="font-semibold">{inspection.odometer_start}</p>
              </div>
            )}
            {inspection.odometer_end && (
              <div>
                <p className="text-slate-500">Odometer End</p>
                <p className="font-semibold">{inspection.odometer_end}</p>
              </div>
            )}
            {inspection.start_fuel_level && (
              <div>
                <p className="text-slate-500">Start Fuel</p>
                <p className="font-semibold">{inspection.start_fuel_level}</p>
              </div>
            )}
            {inspection.end_fuel_level && (
              <div>
                <p className="text-slate-500">End Fuel</p>
                <p className="font-semibold">{inspection.end_fuel_level}</p>
              </div>
            )}
          </div>

          {inspection.is_satisfactory ? (
            <div className="bg-emerald-50 text-emerald-700 font-medium px-4 py-3 rounded-lg text-sm">
              ✓ Vehicle Satisfactory — No Defects Reported
            </div>
          ) : (
            <>
              {allDefects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Defects Found:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allDefects.map((d) => <DefectBadge key={d} defectId={d} />)}
                  </div>
                </div>
              )}
            </>
          )}

          {inspection.concerns && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Concerns:</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{inspection.concerns}</p>
            </div>
          )}
          {inspection.post_trip_concerns && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Post-Trip Concerns:</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{inspection.post_trip_concerns}</p>
            </div>
          )}
          {inspection.post_trip_remarks && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Post-Trip Remarks:</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{inspection.post_trip_remarks}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Admin / Mechanic Notes:</p>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes for maintenance team..."
              className="min-h-[80px] rounded-xl"
            />
          </div>

          <Button onClick={saveNotes} className="w-full rounded-xl bg-[#1B3A5C] hover:bg-[#142d47]">
            Save Notes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}