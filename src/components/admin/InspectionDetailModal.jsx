import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Wrench, CheckCircle2 } from "lucide-react";
import DefectBadge from "./DefectBadge";
import InspectionPDFExport from "./InspectionPDFExport";

export default function InspectionDetailModal({ inspection, open, onClose }) {
  const [adminNotes, setAdminNotes] = useState(inspection?.admin_notes || "");
  const [notesToMechanic, setNotesToMechanic] = useState(inspection?.notes_to_mechanic || "");
  const [mechanicNotes, setMechanicNotes] = useState(inspection?.mechanic_notes || "");
  const [mechanicCertified, setMechanicCertified] = useState(inspection?.mechanic_certified || false);
  const [mechanicName, setMechanicName] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certTime, setCertTime] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    async function loadMechanicInfo() {
      const user = await base44.auth.me();
      if (user?.full_name) {
        setMechanicName(user.full_name);
      } else if (user?.email) {
        const emailName = user.email.split('@')[0];
        const nameParts = emailName.split('.');
        const formattedName = nameParts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
        setMechanicName(formattedName);
      }
    }
    loadMechanicInfo();
  }, []);

  if (!inspection) return null;

  const allDefects = [...(inspection.defects || []), ...(inspection.air_brake_checks || [])];

  const saveNotes = async () => {
    const updateData = { 
      admin_notes: adminNotes,
      notes_to_mechanic: notesToMechanic,
      mechanic_notes: mechanicNotes
    };
    await base44.entities.Inspection.update(inspection.id, updateData);
    toast.success("Notes saved");
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
    onClose();
  };

  const certifyFixed = async () => {
    if (!certDate || !certTime) {
      toast.error("Please set certification date and time");
      return;
    }
    
    const etDateTimeString = `${certDate} ${certTime}:00`;
    const certTimestamp = toDate(etDateTimeString, { timeZone: "America/New_York" }).toISOString();
    
    const updateData = {
      mechanic_certified: true,
      mechanic_certified_by: mechanicName,
      mechanic_certified_datetime: certTimestamp,
      mechanic_notes: mechanicNotes,
      status: "resolved"
    };
    
    await base44.entities.Inspection.update(inspection.id, updateData);
    toast.success("Inspection certified as fixed");
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Bus #{inspection.bus_number} — {inspection.inspection_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"}
            </DialogTitle>
            <InspectionPDFExport inspection={inspection} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Driver</p>
              <p className="font-semibold">{inspection.driver_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Date/Time</p>
              <p className="font-semibold">{formatInTimeZone(new Date(inspection.created_date), 'America/New_York', 'MMM d, yyyy h:mm a')} ET</p>
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
            {inspection.inspection_type === "combined" && inspection.odometer_start && inspection.odometer_end && (
              <div>
                <p className="text-slate-500">Total Miles</p>
                <p className="font-semibold">{(parseFloat(inspection.odometer_end) - parseFloat(inspection.odometer_start)).toFixed(1)} mi</p>
              </div>
            )}
            {inspection.inspection_type === "combined" && (
              <div>
                <p className="text-slate-500">Total Hours</p>
                <p className="font-semibold">{(() => {
                  const preTrip = new Date(inspection.inspection_datetime || inspection.submitted_at || inspection.created_date);
                  const postTrip = new Date(inspection.post_trip_datetime || inspection.submitted_at || inspection.created_date);
                  const diffMs = postTrip - preTrip;
                  const totalMinutes = Math.floor(diffMs / (1000 * 60));
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  return diffMs > 0 ? `${hours}h ${minutes}m` : 'N/A';
                })()}</p>
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

          <div className="border-t pt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Notes to Mechanic:</p>
              <Textarea
                value={notesToMechanic}
                onChange={(e) => setNotesToMechanic(e.target.value)}
                placeholder="Driver notes for mechanic..."
                className="min-h-[60px] rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Admin Notes:</p>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Administrative notes..."
                className="min-h-[60px] rounded-xl"
              />
            </div>
          </div>

          {inspection.mechanic_certified && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <p className="font-bold">Certified Fixed</p>
                  <p className="text-xs text-emerald-700">
                    By {inspection.mechanic_certified_by} on {formatInTimeZone(new Date(inspection.mechanic_certified_datetime), 'America/New_York', 'MMM d, yyyy h:mm a')} ET
                  </p>
                </div>
              </div>
            </div>
          )}

          {!inspection.mechanic_certified && !inspection.is_satisfactory && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Wrench className="w-5 h-5" />
                <p className="font-bold">Mechanic Certification</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Repair Synopsis</label>
                <Textarea
                  value={mechanicNotes}
                  onChange={(e) => setMechanicNotes(e.target.value)}
                  placeholder="Detail the work performed, parts replaced, tests conducted..."
                  className="min-h-[80px] rounded-xl"
                />
              </div>
              
              <Input
                placeholder="Mechanic Name"
                value={mechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                className="rounded-xl"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Date Fixed</label>
                  <Input
                    type="date"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Time Fixed</label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={certTime}
                      onChange={(e) => setCertTime(e.target.value)}
                      className="rounded-xl flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setCertDate(formatInTimeZone(now, "America/New_York", "yyyy-MM-dd"));
                        setCertTime(formatInTimeZone(now, "America/New_York", "HH:mm"));
                      }}
                      variant="outline"
                      className="rounded-xl px-3"
                    >
                      Now
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={certifyFixed} 
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Certify All Defects Fixed
              </Button>
            </div>
          )}

          <Button onClick={saveNotes} className="w-full rounded-xl bg-[#1B3A5C] hover:bg-[#142d47]">
            Save Notes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}