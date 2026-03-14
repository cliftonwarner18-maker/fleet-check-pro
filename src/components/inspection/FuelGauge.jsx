import React from "react";
import { FUEL_LEVELS } from "./ChecklistData";
import { cn } from "@/lib/utils";

export default function FuelGauge({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-1">
        {FUEL_LEVELS.map((level) => {
          const idx = FUEL_LEVELS.indexOf(level);
          const isSelected = value === level;
          const selectedIdx = FUEL_LEVELS.indexOf(value);
          const isFilled = value && idx <= selectedIdx;
          
          // Color gradient from red (E) to green (F)
          const colorClass = idx <= 1
            ? "bg-red-500 border-red-500"
            : idx <= 3
            ? "bg-amber-500 border-amber-500"
            : "bg-emerald-500 border-emerald-500";

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                "flex-1 h-8 rounded-sm border-2 transition-all text-[10px] font-bold",
                isFilled
                  ? `${colorClass} text-white`
                  : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300"
              )}
            >
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}