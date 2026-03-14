import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ClipboardCheck, ClipboardList, LogOut, History, Bus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DriverHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: recentInspections } = useQuery({
    queryKey: ["my-inspections"],
    queryFn: () => base44.entities.Inspection.filter(
      { driver_name: user?.full_name },
      "-created_date",
      5
    ),
    enabled: !!user?.full_name,
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B3A5C] to-[#0f2540]">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center text-white pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <Bus className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">NC Bus Inspection</h1>
          <p className="text-blue-200 text-sm mt-1">New Hanover County Schools</p>
          {user && (
            <p className="text-blue-300 text-xs mt-3 font-medium">
              Welcome, {user.full_name}
            </p>
          )}
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          <Link to="/PreTrip" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all flex items-center gap-4 active:scale-[0.98]">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Pre-Trip Inspection</h2>
                <p className="text-slate-500 text-sm mt-0.5">Start your daily vehicle check</p>
              </div>
            </div>
          </Link>

          <Link to="/PostTrip" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all flex items-center gap-4 active:scale-[0.98]">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Post-Trip Inspection</h2>
                <p className="text-slate-500 text-sm mt-0.5">End of day report & fuel levels</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Inspections */}
        {recentInspections.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <History className="w-4 h-4 text-blue-300" />
              <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wide">Recent Submissions</h3>
            </div>
            <div className="space-y-2">
              {recentInspections.map((insp) => (
                <div key={insp.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">Bus #{insp.bus_number}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          insp.inspection_type === "pre_trip"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        )}>
                          {insp.inspection_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"}
                        </span>
                      </div>
                      <p className="text-blue-300 text-xs mt-1">
                        {format(new Date(insp.created_date), "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      insp.is_satisfactory ? "bg-emerald-500/20" : "bg-red-500/20"
                    )}>
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        insp.is_satisfactory ? "bg-emerald-400" : "bg-red-400"
                      )} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Console Access (only show for admin users) */}
        {user?.role === "admin" && (
          <Link to="/AdminDashboard" className="block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-all flex items-center gap-3 active:scale-[0.98]">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">Admin Console</h2>
                <p className="text-blue-300 text-xs mt-0.5">Manage inspections & reports</p>
              </div>
            </div>
          </Link>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full text-blue-300 hover:text-white hover:bg-white/10 rounded-xl h-12"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}