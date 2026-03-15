import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import NCHeader from "@/components/inspection/NCHeader";
import SafetyDisclosure from "@/components/inspection/SafetyDisclosure";
import FuelGauge from "@/components/inspection/FuelGauge";
import ChecklistGrid from "@/components/inspection/ChecklistGrid";

export default function PreTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const inspectionId = new URLSearchParams(location.search).get('id');
  const isEditing = !!inspectionId;
  
  const [submitting, setSubmitting] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [routeNumbers, setRouteNumbers] = useState("");
  const [isECBus, setIsECBus] = useState(false);
  const [odometerStart, setOdometerStart] = useState("");
  const [startFuel, setStartFuel] = useState("");
  const [startDef, setStartDef] = useState("");
  const [isSatisfactory, setIsSatisfactory] = useState(false);
  const [defects, setDefects] = useState([]);
  const [airBrakeChecks, setAirBrakeChecks] = useState([]);
  const [concerns, setConcerns] = useState("");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionTime, setInspectionTime] = useState("");

  const { data: buses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: () => base44.entities.Bus.filter({ is_active: true }, "bus_number")
  });

  const { data: existingInspection } = useQuery({
    queryKey: ["inspection", inspectionId],
    queryFn: async () => {
      if (!inspectionId) return null;
      const inspections = await base44.entities.Inspection.filter({ id: inspectionId });
      return inspections[0];
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (existingInspection) {
      setDriverName(existingInspection.driver_name);
      setBusNumber(existingInspection.bus_number);
      setRouteNumbers(existingInspection.route_numbers || "");
      setIsECBus(existingInspection.bus_type === "ec");
      setOdometerStart(existingInspection.odometer_start || "");
      setStartFuel(existingInspection.start_fuel_level || "");
      setStartDef(existingInspection.start_def_level || "");
      setIsSatisfactory(existingInspection.is_satisfactory || false);
      setDefects(existingInspection.defects || []);
      setAirBrakeChecks(existingInspection.air_brake_checks || []);
      setConcerns(existingInspection.concerns || "");
      if (existingInspection.inspection_datetime) {
        const date = new Date(existingInspection.inspection_datetime);
        setInspectionDate(date.toISOString().split('T')[0]);
        setInspectionTime(date.toTimeString().slice(0, 5));
      }
    }
  }, [existingInspection]);

  useEffect(() => {
    if (isEditing) return; // Skip if editing (will be loaded from existingInspection instead)
    async function loadUser() {
      const user = await base44.auth.me();
      if (user?.full_name) {
        setDriverName(user.full_name);
      } else if (user?.email) {
        // Extract name from email format: firstname.lastname@nhcs.net
        const emailName = user.email.split('@')[0];
        const nameParts = emailName.split('.');
        const formattedName = nameParts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
        setDriverName(formattedName);
      }
    }
    loadUser();
  }, [isEditing]);

  const hasDefects = defects.length > 0 || airBrakeChecks.length > 0;

  const toggleDefect = (id) => {
    setDefects(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    if (isSatisfactory) setIsSatisfactory(false);
  };

  const toggleAirBrake = (id) => {
    setAirBrakeChecks(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    if (isSatisfactory) setIsSatisfactory(false);
  };

  const handleSatisfactoryToggle = () => {
    if (!isSatisfactory) {
      setDefects([]);
      setAirBrakeChecks([]);
    }
    setIsSatisfactory(!isSatisfactory);
  };

  const handleSubmit = async () => {
    if (!driverName.trim() || !busNumber.trim()) {
      toast.error("Please enter driver name and bus number");
      return;
    }
    setSubmitting(true);
    
    let inspectionDateTime = null;
    if (inspectionDate && inspectionTime) {
      const etDateTime = `${inspectionDate}T${inspectionTime}:00-05:00`;
      inspectionDateTime = new Date(etDateTime).toISOString();
    } else if (inspectionDate) {
      const etDateTime = `${inspectionDate}T00:00:00-05:00`;
      inspectionDateTime = new Date(etDateTime).toISOString();
    }
    
    const inspectionData = {
      driver_name: driverName,
      bus_number: busNumber,
      route_numbers: routeNumbers,
      bus_type: isECBus ? "ec" : "school",
      inspection_type: "pre_trip",
      is_satisfactory: isSatisfactory,
      defects: defects,
      air_brake_checks: airBrakeChecks,
      concerns: concerns,
      start_fuel_level: startFuel,
      start_def_level: startDef,
      odometer_start: odometerStart,
      status: "pending_post_trip",
      is_locked: false,
      inspection_datetime: inspectionDateTime,
      submitted_at: new Date().toISOString(),
    };

    if (isEditing) {
      await base44.entities.Inspection.update(inspectionId, inspectionData);
      toast.success("Pre-Trip inspection updated successfully!");
    } else {
      await base44.entities.Inspection.create(inspectionData);
      toast.success("Pre-Trip inspection submitted successfully!");
    }
    setSubmitting(false);
    navigate("/DriverHome");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <NCHeader title="Pre-Trip Inspection" subtitle="FleetCheck Pro • NC School / Activity Bus" />
        
        <SafetyDisclosure />

        {/* Date & Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Inspection Date & Time</h2>
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
                    setInspectionDate(now.toISOString().split('T')[0]);
                    setInspectionTime(now.toTimeString().slice(0, 5));
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
          <Input
            placeholder="Driver Name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="h-12 rounded-xl"
          />
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
              <Input
                placeholder="Bus #"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="h-12 rounded-xl"
              />
            )}
            <Input
              placeholder="Route #(s)"
              value={routeNumbers}
              onChange={(e) => setRouteNumbers(e.target.value)}
              className="h-12 rounded-xl"
            />
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
          <Input
            placeholder="Odometer Start"
            value={odometerStart}
            onChange={(e) => setOdometerStart(e.target.value)}
            className="h-12 rounded-xl"
            type="number"
          />
        </div>

        {/* Fuel & DEF Levels */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Fluid Levels</h2>
          <FuelGauge label="Start Fuel Level" value={startFuel} onChange={setStartFuel} />
          <FuelGauge label="Start DEF Level" value={startDef} onChange={setStartDef} />
        </div>

        {/* Quick Satisfactory */}
        <button
          type="button"
          onClick={handleSatisfactoryToggle}
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
          <div className="text-left flex-1">
            <p className={cn("font-bold", isSatisfactory ? "text-emerald-800" : "text-slate-700")}>
              Bus is Safe and Satisfactory
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{isSatisfactory ? "✓ No defects — ready to operate" : "No defects found — bus is ready to operate"}</p>
          </div>
        </button>

        {/* Inspection Checklist */}
        {!isSatisfactory && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <ChecklistGrid
              selectedDefects={defects}
              onToggle={toggleDefect}
              airBrakeChecks={airBrakeChecks}
              onToggleAirBrake={toggleAirBrake}
              showECItems={isECBus}
            />
          </div>
        )}

        {/* Concerns */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Concerns / Notes</h2>
          <Textarea
            placeholder="Describe any concerns or additional details..."
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            className="min-h-[100px] rounded-xl resize-none"
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