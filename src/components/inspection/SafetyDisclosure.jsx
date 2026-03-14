import React from "react";
import { AlertTriangle } from "lucide-react";

export default function SafetyDisclosure() {
  return (
    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">
            Commercial Vehicle Safety Disclosure
          </h3>
          <p className="text-red-800 text-sm mt-1 leading-relaxed">
            <strong>Do Not Operate</strong> this vehicle if safety is in question.
          </p>
          <p className="text-red-700 text-xs mt-2 leading-relaxed">
            Operating any Commercial Vehicle with prior knowledge of defects could result in{" "}
            <strong>"Injury"</strong> or <strong>"Death"</strong> as well as the potential of
            legal trouble in the event of an Accident/Incident. Failure to report known defects
            while operating a school or activity bus may result in <strong>criminal penalties</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}