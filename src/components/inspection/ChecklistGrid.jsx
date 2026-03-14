import React from "react";
import { CHECKLIST_ITEMS, PLABS_ITEMS, EC_ITEMS } from "./ChecklistData";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function ChecklistGrid({ selectedDefects, onToggle, airBrakeChecks, onToggleAirBrake, showECItems = false }) {
  return (
    <div className="space-y-6">
      {/* Main Checklist */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-8 bg-amber-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Check Only Where Issues Are Present
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = selectedDefects.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border",
                  isChecked
                    ? "bg-red-50 border-red-300 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  className={cn(
                    "h-5 w-5 rounded border-2 flex-shrink-0",
                    isChecked ? "border-red-500 bg-red-500 text-white" : "border-slate-300"
                  )}
                />
                <span className={cn(
                  "text-sm",
                  isChecked ? "text-red-800 font-semibold" : "text-slate-600"
                )}>
                  <span className="text-slate-400 font-mono text-xs mr-1">{item.id}.</span>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PLABS Air Brake Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-8 bg-blue-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Air Brakes — P.L.A.B.S.
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3 italic">
          When Pre-Trip inspecting a bus equipped with "Air Brakes" — Remember P.L.A.B.S.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {PLABS_ITEMS.map((item) => {
            const isChecked = airBrakeChecks.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleAirBrake(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border",
                  isChecked
                    ? "bg-red-50 border-red-300 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  className={cn(
                    "h-5 w-5 rounded border-2 flex-shrink-0",
                    isChecked ? "border-red-500 bg-red-500 text-white" : "border-slate-300"
                  )}
                />
                <span className={cn(
                  "text-sm",
                  isChecked ? "text-red-800 font-semibold" : "text-slate-600"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EC Bus Equipment Section */}
      {showECItems && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-8 bg-purple-500 rounded-full" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              EC Bus Equipment
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {EC_ITEMS.map((item) => {
              const isChecked = selectedDefects.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border",
                    isChecked
                      ? "bg-red-50 border-red-300 shadow-sm"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    className={cn(
                      "h-5 w-5 rounded border-2 flex-shrink-0",
                      isChecked ? "border-red-500 bg-red-500 text-white" : "border-slate-300"
                    )}
                  />
                  <span className={cn(
                    "text-sm",
                    isChecked ? "text-red-800 font-semibold" : "text-slate-600"
                  )}>
                    <span className="text-slate-400 font-mono text-xs mr-1">{item.id}.</span>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
      );
      }