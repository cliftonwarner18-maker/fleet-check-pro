import React from "react";
import { Bus } from "lucide-react";

export default function NCHeader({ title, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-[#1B3A5C] to-[#2A5280] text-white px-5 py-5 rounded-2xl shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white/15 p-2.5 rounded-xl">
          <Bus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          <p className="text-blue-200 text-xs font-medium mt-0.5">{subtitle || "North Carolina Public Schools"}</p>
        </div>
      </div>
    </div>
  );
}