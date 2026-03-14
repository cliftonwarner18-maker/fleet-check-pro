import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import FuelGauge from "@/components/inspection/FuelGauge";
import ChecklistGrid from "@/components/inspection/ChecklistGrid";

export default function EditInspectionDialog({ inspection, open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [editReason, setEditReason] = useState("");
  
  const [formData, setFormData] = useState({
    driver_name: inspection?.driver_name || "",
    bus_number: inspection?.bus_number || "",
    route_numbers: inspection?.route_numbers || "",
    bus_type: inspection?.bus_type || "regular",
    is_satisfactory: inspection?.is_satisfactory || false,
    defects: inspection?.defects || [],
    air_brake_checks: inspection?.air_brake_checks || [],
    concerns: inspection?.concerns || "",
    start_fuel_level: inspection?.start_fuel_level || "",
    start_def_level: inspection?.start_def_level || "",
    end_fuel_level: inspection?.end_fuel_level || "",
    end_def_level: inspection?.end_def_level || "",
    odometer_start: inspection?.odometer_start || "",
    odometer_end: inspection?.odometer_end || "",
    post_trip_concerns: inspection?.post_trip_concerns || "",
    post_trip_remarks: inspection?.post_trip_remarks || "",
    num_transported: inspection?.num_transported || "",
    admin_notes: inspection?.admin_notes || "",
  });

  if (!inspection) return null;

  const isPre = inspection.inspection_type === "pre_trip";

  const toggleDefect = (id) => {
    setFormData(prev => ({
      ...prev,
      defects: prev.defects.includes(id) 
        ? prev.defects.filter(d => d !== id) 
        : [...prev.defects, id],
      is_satisfactory: false
    }));
  };

  const toggleAirBrake = (id) => {
    setFormData(prev => ({
      ...prev,
      air_brake_checks: prev.air_brake_checks.includes(id)
        ? prev.air_brake_checks.filter(d => d !== id)
        : [...prev.air_brake_checks, id],
      is_satisfactory: false
    }));
  };

  const handleSave = async () => {
    if (!editReason.trim()) {
      toast.error("Please provide a reason for editing this inspection");
      return;
    }

    setSaving(true);
    const editLog = `\n[EDITED ${new Date().toLocaleString()}]: ${editReason}`;
    const dataToSave = {
      ...formData,
      num_transported: formData.num_transported ? parseInt(formData.num_transported) : undefined,
      admin_notes: (formData.admin_notes || "") + editLog
    };
    await base44.entities.Inspection.update(inspection.id, dataToSave);
    toast.success("Inspection updated successfully");
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {isPre ? "Pre-Trip" : "Post-Trip"} Inspection - Bus #{inspection.bus_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Edit Reason */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <Label className="text-sm font-semibold text-amber-900">Reason for Edit *</Label>
            <Textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Document why this inspection is being modified..."
              className="mt-2 bg-white"
              rows={2}
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Driver Name</Label>
              <Input
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Bus Number</Label>
              <Input
                value={formData.bus_number}
                onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Route Numbers</Label>
              <Input
                value={formData.route_numbers}
                onChange={(e) => setFormData({ ...formData, route_numbers: e.target.value })}
              />
            </div>
            <div>
              <Label>Bus Type</Label>
              <Select value={formData.bus_type} onValueChange={(v) => setFormData({ ...formData, bus_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ec">EC Bus</SelectItem>
                  <SelectItem value="activity">Activity Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fuel Levels */}
          {isPre && (
            <div className="space-y-3">
              <FuelGauge 
                label="Start Fuel Level" 
                value={formData.start_fuel_level} 
                onChange={(v) => setFormData({ ...formData, start_fuel_level: v })} 
              />
              <FuelGauge 
                label="Start DEF Level" 
                value={formData.start_def_level} 
                onChange={(v) => setFormData({ ...formData, start_def_level: v })} 
              />
            </div>
          )}

          {!isPre && (
            <div className="space-y-3">
              <FuelGauge 
                label="End Fuel Level" 
                value={formData.end_fuel_level} 
                onChange={(v) => setFormData({ ...formData, end_fuel_level: v })} 
              />
              <FuelGauge 
                label="End DEF Level" 
                value={formData.end_def_level} 
                onChange={(v) => setFormData({ ...formData, end_def_level: v })} 
              />
            </div>
          )}

          {/* Satisfactory Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.is_satisfactory}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                is_satisfactory: checked,
                defects: checked ? [] : formData.defects,
                air_brake_checks: checked ? [] : formData.air_brake_checks
              })}
            />
            <Label>Vehicle {isPre ? "Pre-Trip" : "Post-Trip"} Satisfactory</Label>
          </div>

          {/* Defects Checklist */}
          {!formData.is_satisfactory && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">Defects / Issues</Label>
              <ChecklistGrid
                selectedDefects={formData.defects}
                onToggle={toggleDefect}
                airBrakeChecks={formData.air_brake_checks}
                onToggleAirBrake={toggleAirBrake}
              />
            </div>
          )}

          {/* Concerns */}
          <div>
            <Label>Concerns</Label>
            <Textarea
              value={isPre ? formData.concerns : formData.post_trip_concerns}
              onChange={(e) => setFormData({ 
                ...formData, 
                [isPre ? "concerns" : "post_trip_concerns"]: e.target.value 
              })}
              className="mt-1"
            />
          </div>

          {/* Admin Notes */}
          <div>
            <Label>Admin Notes</Label>
            <Textarea
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-[#1B3A5C] hover:bg-[#142d47]"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}