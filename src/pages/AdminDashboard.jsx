import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, AlertTriangle, CheckCircle, Clock, Search, Shield, ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";
import InspectionCard from "@/components/admin/InspectionCard";
import InspectionDetailModal from "@/components/admin/InspectionDetailModal";
import EditInspectionDialog from "@/components/admin/EditInspectionDialog";
import TD28DExport from "@/components/admin/TD28DExport";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [editingInspection, setEditingInspection] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["inspections"],
    queryFn: () => base44.entities.Inspection.list("-created_date", 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inspection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Status updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Inspection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Inspection deleted");
      setDeleteId(null);
    },
  });

  const handleUpdateStatus = (id, newStatus) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const filtered = inspections.filter((insp) => {
    const matchStatus = statusFilter === "all" || 
      (statusFilter === "active_defects" 
        ? (!insp.is_satisfactory || insp.repair_still_needed) 
        : insp.status === statusFilter);
    const matchType = typeFilter === "all" || insp.inspection_type === typeFilter;
    const matchSearch = !searchQuery ||
      insp.bus_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insp.driver_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const pendingCount = inspections.filter(i => i.status === "pending_post_trip").length;
  const todayCount = inspections.filter(i =>
    format(new Date(i.created_date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;
  const defectCount = inspections.filter(i => 
    (!i.is_satisfactory && i.status === "pending_post_trip") || i.repair_still_needed
  ).length;

  const todayInspections = inspections.filter(i =>
    format(new Date(i.created_date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/DriverHome")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="bg-[#1B3A5C] p-2.5 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm">FleetCheck Pro • NHCS Transportation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/FleetManagement")}
                className="rounded-xl"
              >
                <Settings className="w-4 h-4 mr-2" /> Fleet Management
              </Button>
              <TD28DExport inspections={todayInspections} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                <p className="text-sm text-slate-500">Pending Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{defectCount}</p>
                <p className="text-sm text-slate-500">Active Defects</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{todayCount}</p>
                <p className="text-sm text-slate-500">Today's Inspections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search bus # or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active_defects">Active Defects</SelectItem>
                <SelectItem value="pending_post_trip">Pending Post-Trip</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pre_trip">Pre-Trip</SelectItem>
                <SelectItem value="post_trip">Post-Trip</SelectItem>
                <SelectItem value="combined">Combined Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No inspections found</p>
            <p className="text-sm mt-1">Adjust your filters or wait for driver submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((insp) => (
              <InspectionCard
                key={insp.id}
                inspection={insp}
                onView={setSelectedInspection}
                onEdit={setEditingInspection}
                onUpdateStatus={handleUpdateStatus}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}

        {/* Branding */}
        <div className="text-center py-6">
          <p className="text-[10px] text-slate-400">
            Powered By: <span className="font-semibold">Base44</span> • Designed By: <span className="font-semibold">Clifton M Warner</span>
          </p>
        </div>
      </div>

      <InspectionDetailModal
        inspection={selectedInspection}
        open={!!selectedInspection}
        onClose={() => setSelectedInspection(null)}
      />

      <EditInspectionDialog
        inspection={editingInspection}
        open={!!editingInspection}
        onClose={() => setEditingInspection(null)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inspection?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The inspection record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}