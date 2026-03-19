import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { DEFECT_LABEL_MAP, EC_ITEMS, CHECKLIST_ITEMS, PLABS_ITEMS } from "@/components/inspection/ChecklistData";

const CHECKLIST_IDS = [
  "1","2","3","4","5","6","7","8","9","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","25b","26","27","28","29",
  "30","31","31f","31r","32","32b","33","34","38","38a","38r"
];

function checkboxHtml(checked) {
  return `<span style="display:inline-block;width:12px;height:12px;border:1.5px solid #000;text-align:center;line-height:10px;font-weight:bold;font-size:9px;">${checked ? "X" : "&nbsp;"}</span>`;
}

export default function InspectionPDFExport({ inspection }) {
  const isPre = inspection.inspection_type === "pre_trip";

  const handlePrint = () => {
    const allDefects = [...(inspection.defects || []), ...(inspection.air_brake_checks || [])];

    const checklistGrid = CHECKLIST_IDS.map(id => {
      const label = DEFECT_LABEL_MAP[id] || id;
      const checked = inspection.defects?.includes(id);
      return `<div style="display:flex;align-items:center;gap:4px;font-size:9px;">${checkboxHtml(checked)}<span>${id}. ${label}</span></div>`;
    }).join("");

    const ecGrid = inspection.bus_type === "ec" ? EC_ITEMS.map(item => {
      const checked = inspection.defects?.includes(item.id);
      return `<div style="display:flex;align-items:center;gap:4px;font-size:9px;">${checkboxHtml(checked)}<span>${item.id}. ${item.label}</span></div>`;
    }).join("") : "";

    const plabsRow = PLABS_ITEMS.map(item => {
      const checked = inspection.air_brake_checks?.includes(item.id);
      return `<div style="display:flex;align-items:center;gap:4px;font-size:9px;margin-right:12px;">${checkboxHtml(checked)}<span>${item.label}</span></div>`;
    }).join("");

    const satisfactoryBanner = inspection.is_satisfactory
      ? `<div style="margin:10px 0;padding:10px;border:2px solid #22c55e;background:#f0fdf4;text-align:center;font-size:11px;font-weight:bold;">
           ✓ VEHICLE IS SAFE AND ${isPre ? "PRE" : "POST"}-TRIP SATISFACTORY
           <div style="font-size:9px;margin-top:4px;font-weight:normal;">
             ${isPre ? "Bus is safe to operate - No defects or issues reported" : "No end-of-day issues or defects reported"}
           </div>
         </div>`
      : "";

    const checklistSection = !inspection.is_satisfactory ? `
      <div style="margin:10px 0;border:2px solid #000;padding:10px;">
        <div style="font-weight:bold;text-align:center;margin-bottom:8px;font-size:11px;text-transform:uppercase;">
          * ${isPre ? "PRE" : "POST"}-TRIP INSPECTION * ( ONLY CHECK BOX IF AN ISSUE IS PRESENT )
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;">
          ${checklistGrid}
        </div>
      </div>
      ${inspection.bus_type === "ec" ? `
        <div style="margin:10px 0;border:2px solid #000;padding:10px;">
          <div style="font-weight:bold;text-align:center;margin-bottom:8px;font-size:11px;text-transform:uppercase;">* ADDITIONAL EC BUS EQUIPMENT *</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;">${ecGrid}</div>
        </div>` : ""}
      ${isPre ? `
        <div style="margin:10px 0;padding:8px;border:1px solid #000;">
          <strong>When Pre Trip Inspecting a bus equipped with "Air Brakes" Remember P.L.A.B.S.</strong>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">${plabsRow}</div>
        </div>` : ""}
    ` : "";

    const concernsSection = isPre && inspection.concerns ? `
      <div style="margin:10px 0;border:1px solid #000;padding:8px;">
        <strong style="display:block;margin-bottom:4px;font-size:10px;">Concerns:</strong>
        <p style="margin:0;min-height:40px;font-size:9px;line-height:1.4;">${inspection.concerns}</p>
      </div>` : "";

    const postTripSection = !isPre ? `
      ${!inspection.is_satisfactory ? `<div style="margin:10px 0;padding:10px;border:2px solid #dc2626;background:#fef2f2;text-align:center;font-size:11px;font-weight:bold;color:#991b1b;">⚠ DEFECTS PRESENT — NEEDS ATTENTION OF REPAIR &amp; SAFETY STAFF</div>` : ""}
      ${inspection.post_trip_concerns ? `<div style="margin:10px 0;border:1px solid #000;padding:8px;"><strong style="display:block;margin-bottom:4px;font-size:10px;">Post Trip Concerns:</strong><p style="margin:0;font-size:9px;">${inspection.post_trip_concerns}</p></div>` : ""}
      ${inspection.post_trip_remarks ? `<div style="margin:10px 0;border:1px solid #000;padding:8px;"><strong style="display:block;margin-bottom:4px;font-size:10px;">Post Trip Condition Remarks:</strong><p style="margin:0;font-size:9px;">${inspection.post_trip_remarks}</p></div>` : ""}
      ${inspection.no_students_left ? `<div style="margin:10px 0;padding:10px;border:2px solid #22c55e;background:#f0fdf4;text-align:center;font-size:11px;font-weight:bold;">✓ Post-Trip Complete: No Students Left on Bus</div>` : ""}
    ` : "";

    const adminNotesSection = inspection.admin_notes ? `
      <div style="margin:10px 0;border:1px solid #000;padding:8px;">
        <strong style="display:block;margin-bottom:4px;font-size:10px;">Admin / Mechanic Notes:</strong>
        <p style="margin:0;font-size:9px;">${inspection.admin_notes}</p>
      </div>` : "";

    const mechCertSection = inspection.mechanic_certified ? `
      <div style="margin:10px 0;padding:10px;border:2px solid #22c55e;background:#f0fdf4;">
        <div style="font-weight:bold;font-size:11px;border-bottom:1px solid #22c55e;padding-bottom:5px;margin-bottom:8px;">✓ MECHANIC CERTIFICATION — ALL DEFECTS CORRECTED</div>
        <div style="display:flex;justify-content:space-between;margin:4px 0;font-size:10px;">
          <div><strong>Certified By:</strong> ${inspection.mechanic_certified_by || "N/A"}</div>
          <div><strong>Date/Time:</strong> ${inspection.mechanic_certified_datetime ? formatInTimeZone(new Date(inspection.mechanic_certified_datetime), "America/New_York", "MM/dd/yyyy h:mm a") + " ET" : "N/A"}</div>
        </div>
        ${inspection.mechanic_notes ? `<div style="margin-top:8px;font-size:10px;"><strong>Repair Synopsis:</strong><div style="margin-top:4px;white-space:pre-wrap;font-size:9px;">${inspection.mechanic_notes}</div></div>` : ""}
        <div style="margin-top:10px;border-top:1px solid #22c55e;padding-top:8px;font-size:11px;font-weight:bold;color:#16a34a;">
          ✓ BUS CLEARED FOR SERVICE
        </div>
      </div>` : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${isPre ? "Pre" : "Post"}-Trip Inspection - Bus ${inspection.bus_number}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; max-width: 8.5in; margin: 0 auto; }
    @media print { body { padding: 10px; } @page { margin: 0.5in; } }
  </style>
</head>
<body>
  <div style="text-align:center;border:2px solid #000;padding:8px;margin-bottom:10px;">
    <h1 style="margin:0 0 4px 0;font-size:14px;font-weight:bold;">North Carolina Public Schools</h1>
    <h2 style="margin:0;font-size:12px;font-weight:bold;">* SCHOOL/ACTIVITY BUS ${isPre ? "PRE" : "POST"}-TRIP INSPECTION REPORT *</h2>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;font-size:10px;">
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">District:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">New Hanover County</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">City:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">Wilmington</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">Driver:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">${inspection.driver_name}</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">Date/Time:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">${formatInTimeZone(new Date(inspection.inspection_datetime || inspection.created_date), "America/New_York", "MM/dd/yyyy  •  hh:mm a")}</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">Bus #:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">${inspection.bus_number}</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">Route #'s:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">${inspection.route_numbers || "N/A"}</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">Odometer ${isPre ? "Start" : "End"}:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;">${isPre ? (inspection.odometer_start || "") : (inspection.odometer_end || "")}</span></div>
    <div style="display:flex;gap:5px;align-items:baseline;"><strong style="min-width:100px;">Bus Type:</strong><span style="border-bottom:1px solid #000;flex:1;padding-bottom:1px;text-transform:uppercase;">${inspection.bus_type === "ec" ? "EC" : inspection.bus_type === "activity" ? "ACTIVITY" : "REGULAR"}</span></div>
  </div>

  <div style="margin:10px 0;padding:8px;border:1px solid #000;font-size:10px;">
    <div style="display:flex;gap:20px;margin:4px 0;">
      <strong>${isPre ? "Start" : "End of Day"} Fuel Level:</strong>
      <span>( E | | | | 1/2 | | | | F ) = ${isPre ? (inspection.start_fuel_level || "___") : (inspection.end_fuel_level || "___")}</span>
    </div>
    <div style="display:flex;gap:20px;margin:4px 0;">
      <strong>${isPre ? "Start" : "End of Day"} DEF Level:</strong>
      <span>( E | | | | 1/2 | | | | F ) = ${isPre ? (inspection.start_def_level || "___") : (inspection.end_def_level || "___")}</span>
    </div>
    ${!isPre && inspection.num_transported ? `<div style="display:flex;gap:20px;margin:4px 0;"><strong>No. Transported:</strong><span>${inspection.num_transported}</span></div>` : ""}
  </div>

  ${satisfactoryBanner}
  ${checklistSection}
  ${concernsSection}
  ${postTripSection}
  ${adminNotesSection}

  <div style="margin:10px 0;padding:10px;border:2px solid #000;background:#f9f9f9;font-size:9px;line-height:1.3;">
    <strong style="font-size:10px;text-transform:uppercase;">Commercial Vehicle Safety Disclosure</strong><br/>
    <strong>Do Not Operate this vehicle if safety is in question.</strong><br/>
    Operating any Commercial Vehicle with prior knowledge of defects could result in "Injury" or "Death" as well as
    the potential of legal trouble in the event of an Accident/Incident.
  </div>

  <div style="margin-top:15px;display:flex;justify-content:space-between;gap:20px;">
    <div style="flex:1;border-bottom:1px solid #000;padding-bottom:2px;font-size:10px;">
      <strong>Bus Driver Signature:</strong> X_______________________________
    </div>
    <div style="flex:1;border-bottom:1px solid #000;padding-bottom:2px;font-size:10px;">
      <strong>Type:</strong> [ ${isPre ? "X" : " "} ] Pre-Trip &nbsp; [ ${isPre ? " " : "X"} ] Post-Trip
    </div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-lg gap-2">
      <FileText className="w-4 h-4" />
      Print {isPre ? "Pre" : "Post"}-Trip Form
    </Button>
  );
}