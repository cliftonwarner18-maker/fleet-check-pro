import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Bus, Edit, Trash2, ArrowLeft } from "lucide-react";
import BusHistoryExport from "@/components/admin/BusHistoryExport";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function FleetManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: "",
    bus_type: "school",
    is_ec_bus: false,
    is_active: true,
    notes: ""
  });

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: () => base44.entities.Bus.list("-bus_number")
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ["inspections"],
    queryFn: () => base44.entities.Inspection.list("-created_date", 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Bus.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["buses"]);
      setDialogOpen(false);
      resetForm();
      toast.success("Bus added successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Bus.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["buses"]);
      setDialogOpen(false);
      resetForm();
      toast.success("Bus updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bus.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["buses"]);
      toast.success("Bus deleted successfully");
    }
  });

  const resetForm = () => {
    setFormData({ bus_number: "", bus_type: "school", is_ec_bus: false, is_active: true, notes: "" });
    setEditingBus(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.bus_number.trim()) {
      toast.error("Bus number is required");
      return;
    }

    if (editingBus) {
      updateMutation.mutate({ id: editingBus.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      bus_type: bus.bus_type || "school",
      is_ec_bus: bus.is_ec_bus ?? false,
      is_active: bus.is_active ?? true,
      notes: bus.notes || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this bus?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/AdminDashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#1B3A5C] p-3 rounded-xl">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Fleet Management</h1>
                <p className="text-slate-500 text-sm">FleetCheck Pro • NHCS Transportation</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B3A5C] hover:bg-[#142d47]">
                  <Plus className="w-4 h-4 mr-2" /> Add Bus
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBus ? "Edit Bus" : "Add New Bus"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Bus Number *
                    </label>
                    <Input
                      value={formData.bus_number}
                      onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                      placeholder="e.g., 101"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Bus Type
                    </label>
                    <Select
                      value={formData.bus_type}
                      onValueChange={(value) => setFormData({ ...formData, bus_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="activity">Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Checkbox
                      checked={formData.is_ec_bus}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_ec_bus: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">
                      EC Bus (Wheelchair/Handicapped Equipped)
                    </label>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Status
                    </label>
                    <Select
                      value={formData.is_active ? "active" : "inactive"}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Notes
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#1B3A5C] hover:bg-[#142d47]">
                      {editingBus ? "Update" : "Add"} Bus
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Fleet List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Fleet Roster ({buses.length} buses)</h2>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : buses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No buses in fleet. Add your first bus above.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buses.map((bus) => (
                <div key={bus.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Bus #{bus.bus_number}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {bus.bus_type === "activity" ? "Activity" : "School"}
                        </Badge>
                        {bus.is_ec_bus && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">EC</Badge>
                        )}
                        <Badge className={bus.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>
                          {bus.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {bus.notes && (
                    <p className="text-sm text-slate-600 bg-slate-50 rounded p-2 mb-3">{bus.notes}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <BusHistoryExport busNumber={bus.bus_number} inspections={inspections} />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(bus)} className="flex-1">
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(bus.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="text-center py-6">
          <p className="text-[10px] text-slate-400">
            Powered By: <span className="font-semibold">Base44</span> • Designed By: <span className="font-semibold">Clifton M Warner</span>
          </p>
        </div>
      </div>
    </div>
  );
}