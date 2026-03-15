import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardCheck, ClipboardList, LogOut, Bus, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function DriverHome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: pendingPreTrips = [] } = useQuery({
    queryKey: ["pending-pretrips", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const today = new Date().toISOString().split('T')[0];
      const inspections = await base44.entities.Inspection.filter({
        inspection_type: "pre_trip",
        status: "pending_post_trip",
        created_by: user.email
      }, "-created_date");
      return inspections.filter(i => i.created_date?.startsWith(today));
    },
    enabled: !!user
  });



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B3A5C] to-[#0f2540]">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center text-white pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <Bus className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FleetCheck Pro</h1>
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

          {pendingPreTrips.length > 0 ? (
            pendingPreTrips.map((preTrip) => (
              <button
                key={preTrip.id}
                onClick={() => navigate("/PostTrip", { state: { preTripId: preTrip.id } })}
                className="block w-full"
              >
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all flex items-center gap-4 active:scale-[0.98]">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h2 className="font-bold text-slate-800 text-lg">Complete Post-Trip</h2>
                    <p className="text-slate-600 text-sm mt-0.5">Bus #{preTrip.bus_number} - Pre-Trip Pending</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
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
          )}
        </div>

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

        {/* Branding */}
        <div className="text-center pb-4">
          <p className="text-[10px] text-blue-300/60">
            Powered By: <span className="font-semibold">Base44</span> • Designed By: <span className="font-semibold">Clifton M Warner</span>
          </p>
        </div>
      </div>
    </div>
  );
}