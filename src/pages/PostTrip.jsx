import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2, Send, Loader2, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import NCHeader from "@/components/inspection/NCHeader";
import SafetyDisclosure from "@/components/inspection/SafetyDisclosure";
import FuelGauge from "@/components/inspection/FuelGauge";
import { formatInTimeZone } from "date-fns-tz";

export default function PostTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const preTripId = location.state?.preTripId;
  const postTripId = new URLSearchParams(location.search).get('id');
  const isEditing = !!postTripId;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [routeNumbers, setRouteNumbers] = useState("");
  const [isECBus, setIsECBus] = useState(false);
  const [odometerEnd, setOdometerEnd] = useState("");
  const [endFuel, setEndFuel] = useState("");
  const [endDef, setEndDef] = useState("");
  const [isSatisfactory, setIsSatisfactory] = useState(false);
  const [noStudentsLeft, setNoStudentsLeft] = useState(false);
  const [postConcerns, setPostConcerns] = useState("");
  const [postRemarks, setPostRemarks] = useState("");
  const [numTransported, setNumTransported] = useState("");
  const [repairStillNeeded, setRepairStillNeeded] = useState(false);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionTime, setInspectionTime] = useState("");

  const { data: buses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: () => base44.entities.Bus.filter({ is_active: true }, "bus_number")
  });

  const { data: preTrip } = useQuery({
    queryKey: ["pretrip", preTripId],
    queryFn: async () => {
      if (!preTripId) return null;
      const inspections = await base44.entities.Inspection.filter({ id: preTripId });
      return inspections[0];
    },
    enabled: !!preTripId
  });

  const { data: existingPostTrip } = useQuery({
    queryKey: ["posttrip", postTripId],
    queryFn: async () => {
      if (!postTripId) return null;
      const inspections = await base44.entities.Inspection.filter({ id: postTripId });
      return inspections[0];
    },
    enabled: isEditing
  });

  useEffect(() => {
    async function loadUser() {
      const user = await base44.auth.me();
      if (user?.full_name) {
        setDriverName(user.full_name);
      } else if (user?.email) {
        const emailName = user.email.split('@')[0];
        const nameParts = emailName.split('.');
        const formattedName = nameParts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
        setDriverName(formattedName);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (existingPostTrip) {
      setDriverName(existingPostTrip.driver_name);
      setBusNumber(existingPostTrip.bus_number);
      setRouteNumbers(existingPostTrip.route_numbers || "");
      setIsECBus(existingPostTrip.bus_type === "ec");
      setOdometerEnd(existingPostTrip.odometer_end || "");
      setEndFuel(existingPostTrip.end_fuel_level || "");
      setEndDef(existingPostTrip.end_def_level || "");
      setIsSatisfactory(existingPostTrip.is_satisfactory || false);
      setNoStudentsLeft(existingPostTrip.no_students_left || false);
      setPostConcerns(existingPostTrip.post_trip_concerns || "");
      setPostRemarks(existingPostTrip.post_trip_remarks || "");
      setNumTransported(existingPostTrip.num_transported ? existingPostTrip.num_transported.toString() : "");
      setRepairStillNeeded(existingPostTrip.repair_still_needed || false);
      if (existingPostTrip.updated_date) {
        const date = new Date(existingPostTrip.updated_date);
        setInspectionDate(date.toISOString().split('T')[0]);
        setInspectionTime(date.toTimeString().slice(0, 5));
      }
    }
  }, [existingPostTrip]);

  useEffect(() => {
    if (preTrip) {
      setDriverName(preTrip.driver_name);
      setBusNumber(preTrip.bus_number);
      setRouteNumbers(preTrip.route_numbers || "");
      setIsECBus(preTrip.bus_type === "ec");
    }
  }, [preTrip]);

  const handleSubmit = async () => {
    if (!driverName.trim() || !busNumber.trim()) {
      toast.error("Please enter driver name and bus number");
      return;
    }
    if (!noStudentsLeft) {
      toast.error("You must confirm no students were left on the bus");
      return;
    }
    setSubmitting(true);
    
    let customTimestamp = null;
    if (inspectionDate && inspectionTime) {
      const etDateTime = `${inspectionDate}T${inspectionTime}:00-05:00`;
      customTimestamp = new Date(etDateTime).toISOString();
    } else if (inspectionDate) {
      const etDateTime = `${inspectionDate}T00:00:00-05:00`;
      customTimestamp = new Date(etDateTime).toISOString();
    }
    
    if (isEditing && existingPostTrip) {
      // Update existing post-trip or combined inspection
      const updateData = {
        driver_name: driverName,
        bus_number: busNumber,
        route_numbers: routeNumbers,
        bus_type: isECBus ? "ec" : "school",
        is_satisfactory: isSatisfactory,
        post_trip_concerns: postConcerns,
        post_trip_remarks: postRemarks,
        end_fuel_level: endFuel,
        end_def_level: endDef,
        odometer_end: odometerEnd,
        no_students_left: noStudentsLeft,
        num_transported: numTransported ? parseInt(numTransported) : undefined,
        repair_still_needed: repairStillNeeded,
        ...(customTimestamp && { updated_date: customTimestamp }),
      };
      await base44.entities.Inspection.update(postTripId, updateData);
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Post-Trip inspection updated successfully!");
    } else if (preTripId && preTrip) {
      // Create combined inspection
      await base44.entities.Inspection.create({
        driver_name: driverName,
        bus_number: busNumber,
        route_numbers: routeNumbers,
        bus_type: preTrip.bus_type,
        inspection_type: "combined",
        is_satisfactory: preTrip.is_satisfactory && isSatisfactory,
        defects: preTrip.defects || [],
        air_brake_checks: preTrip.air_brake_checks || [],
        concerns: preTrip.concerns,
        start_fuel_level: preTrip.start_fuel_level,
        start_def_level: preTrip.start_def_level,
        odometer_start: preTrip.odometer_start,
        post_trip_concerns: postConcerns,
        post_trip_remarks: postRemarks,
        end_fuel_level: endFuel,
        end_def_level: endDef,
        odometer_end: odometerEnd,
        no_students_left: noStudentsLeft,
        num_transported: numTransported ? parseInt(numTransported) : undefined,
        repair_still_needed: repairStillNeeded,
        status: "completed",
        is_locked: true,
        pre_trip_id: preTripId,
        created_date: preTrip.created_date,
        ...(customTimestamp && { updated_date: customTimestamp }),
      });
      
      // Delete the original pre-trip record
      await base44.entities.Inspection.delete(preTripId);
      
      toast.success("Daily inspection completed and locked!");
    } else {
      // Standalone post-trip
      await base44.entities.Inspection.create({
        driver_name: driverName,
        bus_number: busNumber,
        route_numbers: routeNumbers,
        bus_type: isECBus ? "ec" : "school",
        inspection_type: "post_trip",
        is_satisfactory: isSatisfactory,
        defects: [],
        air_brake_checks: [],
        post_trip_concerns: postConcerns,
        post_trip_remarks: postRemarks,
        end_fuel_level: endFuel,
        end_def_level: endDef,
        odometer_end: odometerEnd,
        no_students_left: noStudentsLeft,
        num_transported: numTransported ? parseInt(numTransported) : undefined,
        repair_still_needed: repairStillNeeded,
        status: "completed",
        is_locked: false,
        ...(customTimestamp && { created_date: customTimestamp }),
      });
      toast.success("Post-Trip inspection submitted successfully!");
    }
    
    setSubmitting(false);
    navigate("/DriverHome");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <NCHeader title="Post-Trip Inspection" subtitle="FleetCheck Pro • NC School / Activity Bus" />
        
        <SafetyDisclosure />

        {/* Date & Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Post-Trip Date & Time</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Date</label>
              <Input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Time</label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={inspectionTime}
                  onChange={(e) => setInspectionTime(e.target.value)}
                  className="h-12 rounded-xl flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setInspectionDate(formatInTimeZone(now, "America/New_York", "yyyy-MM-dd"));
                    setInspectionTime(formatInTimeZone(now, "America/New_York", "HH:mm"));
                  }}
                  variant="outline"
                  className="h-12 rounded-xl px-4 whitespace-nowrap"
                >
                  Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bus Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Vehicle Information</h2>
          <Input placeholder="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} className="h-12 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            {buses.length > 0 ? (
              <Select value={busNumber} onValueChange={(value) => {
                setBusNumber(value);
                const selectedBus = buses.find(b => b.bus_number === value);
                if (selectedBus) setIsECBus(selectedBus.is_ec_bus || false);
              }}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select Bus #" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.bus_number}>
                      Bus #{bus.bus_number} {bus.is_ec_bus ? "(EC)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="Bus #" value={busNumber} onChange={(e) => setBusNumber(e.target.value)} className="h-12 rounded-xl" />
            )}
            <Input placeholder="Route #(s)" value={routeNumbers} onChange={(e) => setRouteNumbers(e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Checkbox
              checked={isECBus}
              onCheckedChange={setIsECBus}
            />
            <label className="text-sm font-medium text-slate-700">
              EC Bus (Wheelchair/Handicapped Equipped)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="# Transported" value={numTransported} onChange={(e) => setNumTransported(e.target.value)} className="h-12 rounded-xl" type="number" />
            <Input placeholder="Odometer End" value={odometerEnd} onChange={(e) => setOdometerEnd(e.target.value)} className="h-12 rounded-xl" type="number" />
          </div>
        </div>

        {/* Fuel & DEF Levels */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">End of Day Fluid Levels</h2>
          <FuelGauge label="End of Day Fuel Level" value={endFuel} onChange={setEndFuel} />
          <FuelGauge label="End of Day DEF Level" value={endDef} onChange={setEndDef} />
        </div>

        {/* Student Check */}
        <button
          type="button"
          onClick={() => setNoStudentsLeft(!noStudentsLeft)}
          className={cn(
            "w-full rounded-2xl p-5 border-2 transition-all flex items-center gap-4",
            noStudentsLeft
              ? "bg-emerald-50 border-emerald-400 shadow-md"
              : "bg-red-50 border-red-300"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            noStudentsLeft ? "bg-emerald-500" : "bg-red-400"
          )}>
            <UserCheck className={cn("w-7 h-7 text-white")} />
          </div>
          <div className="text-left">
            <p className={cn("font-bold", noStudentsLeft ? "text-emerald-800" : "text-red-800")}>
              {noStudentsLeft ? "Confirmed: No Students Left on Bus" : "⚠ Confirm No Students Left on Bus"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Required — must check before submitting</p>
          </div>
        </button>

        {/* Post-Trip Satisfactory */}
        <button
          type="button"
          onClick={() => setIsSatisfactory(!isSatisfactory)}
          className={cn(
            "w-full rounded-2xl p-5 border-2 transition-all flex items-center gap-4",
            isSatisfactory
              ? "bg-emerald-50 border-emerald-400 shadow-md"
              : "bg-white border-slate-200 hover:border-emerald-300"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            isSatisfactory ? "bg-emerald-500" : "bg-slate-100"
          )}>
            <CheckCircle2 className={cn("w-7 h-7", isSatisfactory ? "text-white" : "text-slate-400")} />
          </div>
          <div className="text-left">
            <p className={cn("font-bold", isSatisfactory ? "text-emerald-800" : "text-slate-700")}>
              Vehicle Post-Trip Satisfactory
            </p>
            <p className="text-xs text-slate-500 mt-0.5">No end-of-day issues to report</p>
          </div>
        </button>

        {/* Still Needs Repair (only show if linked to pre-trip with defects) */}
        {preTrip && !preTrip.is_satisfactory && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={repairStillNeeded}
                onCheckedChange={setRepairStillNeeded}
              />
              <label className="text-sm font-medium text-slate-700">
                ⚠ Issue Still Needs Repair — Pre-Trip defects not resolved
              </label>
            </div>
            {repairStillNeeded && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                This will flag the inspection as "Issue still pending after post trip" for fleet dispatchers.
              </p>
            )}
          </div>
        )}

        {/* Concerns */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Post-Trip Concerns</h2>
          <Textarea
            placeholder="Describe any post-trip concerns..."
            value={postConcerns}
            onChange={(e) => setPostConcerns(e.target.value)}
            className="min-h-[80px] rounded-xl resize-none"
          />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mt-3">Condition Remarks</h2>
          <Textarea
            placeholder="Additional post-trip condition remarks..."
            value={postRemarks}
            onChange={(e) => setPostRemarks(e.target.value)}
            className="min-h-[80px] rounded-xl resize-none"
          />
        </div>

        {/* Submit & Cancel */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/DriverHome")}
            disabled={submitting}
            variant="outline"
            className="h-14 rounded-2xl text-base font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-14 rounded-2xl text-base font-bold bg-[#1B3A5C] hover:bg-[#142d47] shadow-lg"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {isEditing ? "Update" : "Submit"}
          </Button>
        </div>

        <div className="text-center space-y-1 pb-6">
          <p className="text-xs text-slate-400">
            FleetCheck Pro • New Hanover County Schools • Wilmington, NC
          </p>
          <p className="text-[10px] text-slate-300">
            Powered By: <span className="font-semibold">Base44</span> • Designed By: <span className="font-semibold">Clifton M Warner</span>
          </p>
        </div>
      </div>
    </div>
  );
}