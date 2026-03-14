import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
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

  const { data: buses = [] } = useQuery({
    queryKey: ["buses"],
    queryFn: () => base44.entities.Bus.filter({ is_active: true }, "bus_number")
  });

  useEffect(() => {
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
  }, []);

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
    await base44.entities.Inspection.create({
      driver_name: driverName,
      bus_number: busNumber,
      route_numbers: routeNumbers,
      bus_type: "school",
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
    });
    toast.success("Pre-Trip inspection submitted successfully!");
    setSubmitting(false);
    navigate("/DriverHome");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <NCHeader title="Pre-Trip Inspection" subtitle="NC School / Activity Bus" />
        
        <SafetyDisclosure />

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
          <div className="text-left">
            <p className={cn("font-bold", isSatisfactory ? "text-emerald-800" : "text-slate-700")}>
              Vehicle Pre-Trip Satisfactory
            </p>
            <p className="text-xs text-slate-500 mt-0.5">No defects found — bus is ready to operate</p>
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
            Submit
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400 pb-6">
          New Hanover County Schools • Wilmington, NC
        </p>
      </div>
    </div>
  );
}