import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { DEFECT_LABEL_MAP } from "@/components/inspection/ChecklistData";

export default function CombinedInspectionPDF({ inspection }) {
  if (!inspection || inspection.inspection_type !== "combined") return null;

  const handlePrint = () => {
    const cleared = inspection.is_satisfactory || inspection.mechanic_certified;
    const statusColor = cleared ? "#22c55e" : "#dc2626";
    const statusBg = cleared ? "#f0fdf4" : "#fef2f2";

    const preTime = new Date(inspection.inspection_datetime || inspection.submitted_at || inspection.created_date);
    const postTime = new Date(inspection.post_trip_datetime || inspection.submitted_at || inspection.created_date);
    const diffMs = postTime - preTime;
    const totalMinutes = Math.floor(diffMs / 60000);
    const hoursStr = diffMs > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : "N/A";
    const totalMiles = inspection.odometer_start && inspection.odometer_end
      ? (parseFloat(inspection.odometer_end) - parseFloat(inspection.odometer_start)).toFixed(1)
      : "N/A";

    const defectsList = inspection.defects?.length > 0
      ? inspection.defects.map(d => `<div style="margin:2px 0;">• ${DEFECT_LABEL_MAP[d] || d}</div>`).join("")
      : "";
    const brakesList = inspection.air_brake_checks?.length > 0
      ? inspection.air_brake_checks.map(d => `<div style="margin:2px 0;">• ${DEFECT_LABEL_MAP[d] || d}</div>`).join("")
      : "";

    const mechSection = inspection.mechanic_certified ? `
      <div style="margin:15px 0;padding:10px;border:2px solid #22c55e;background:#f0fdf4;">
        <div style="font-weight:bold;font-size:12px;border-bottom:1px solid #22c55e;padding-bottom:5px;margin-bottom:8px;">✓ MECHANIC CERTIFICATION - ALL DEFECTS CORRECTED</div>
        <div style="display:flex;justify-content:space-between;margin:4px 0;">
          <div><strong>Certified By:</strong> ${inspection.mechanic_certified_by || "N/A"}</div>
          <div><strong>Date/Time:</strong> ${inspection.mechanic_certified_datetime ? formatInTimeZone(new Date(inspection.mechanic_certified_datetime), "America/New_York", "MM/dd/yyyy h:mm a") + " ET" : "N/A"}</div>
        </div>
        ${inspection.mechanic_notes ? `<div style="margin-top:10px;"><strong>Repair Synopsis:</strong><div style="margin-top:5px;white-space:pre-wrap;">${inspection.mechanic_notes}</div></div>` : ""}
      </div>` : "";

    const adminSection = inspection.admin_notes ? `
      <div style="margin:15px 0;padding:10px;border:1px solid #000;">
        <div style="font-weight:bold;font-size:12px;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:8px;">ADMINISTRATIVE NOTES</div>
        <div style="white-space:pre-wrap;">${inspection.admin_notes}</div>
      </div>` : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Daily Inspection Report - Bus #${inspection.bus_number}</title>
  <style>
    body { font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
    @media print { @page { margin: 0.5in; } body { padding: 10px; } }
  </style>
</head>
<body>
  <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px;">
    <h1 style="margin:0;font-size:16px;font-weight:bold;">DAILY VEHICLE INSPECTION REPORT</h1>
    <p style="margin:2px 0;font-size:10px;">North Carolina School Bus - Pre-Trip &amp; Post-Trip Combined</p>
    <p style="margin:2px 0;font-size:10px;">New Hanover County Schools • Wilmington, NC</p>
  </div>

  <div style="margin:15px 0;border:1px solid #000;padding:10px;">
    <div style="font-weight:bold;font-size:12px;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:8px;">VEHICLE &amp; DRIVER INFORMATION</div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Driver:</strong> ${inspection.driver_name}</div>
      <div><strong>Date:</strong> ${formatInTimeZone(new Date(inspection.created_date), "America/New_York", "MM/dd/yyyy")}</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Bus Number:</strong> ${inspection.bus_number}</div>
      <div><strong>Route(s):</strong> ${inspection.route_numbers || "N/A"}</div>
    </div>
    <div style="margin:3px 0;"><strong>Bus Type:</strong> ${inspection.bus_type === "ec" ? "EC (Wheelchair/Handicapped)" : "Standard School Bus"}</div>
  </div>

  <div style="margin:15px 0;border:1px solid #000;padding:10px;">
    <div style="font-weight:bold;font-size:12px;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:8px;">PRE-TRIP INSPECTION</div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Status:</strong> ${inspection.is_satisfactory && (!inspection.defects || inspection.defects.length === 0) ? "SATISFACTORY - No Defects" : "DEFECTS REPORTED"}</div>
      <div><strong>Odometer Start:</strong> ${inspection.odometer_start || "N/A"}</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Fuel Start:</strong> ${inspection.start_fuel_level || "N/A"}</div>
      <div><strong>DEF Start:</strong> ${inspection.start_def_level || "N/A"}</div>
    </div>
    ${defectsList ? `<div style="margin-top:10px;"><strong>Reported Defects:</strong><div style="margin-top:5px;padding-left:15px;">${defectsList}</div></div>` : ""}
    ${brakesList ? `<div style="margin-top:10px;"><strong>Air Brake (P.L.A.B.S.) Issues:</strong><div style="margin-top:5px;padding-left:15px;">${brakesList}</div></div>` : ""}
    ${inspection.concerns ? `<div style="margin-top:10px;"><strong>Pre-Trip Concerns:</strong><div style="margin-top:5px;white-space:pre-wrap;">${inspection.concerns}</div></div>` : ""}
  </div>

  <div style="margin:15px 0;border:1px solid #000;padding:10px;">
    <div style="font-weight:bold;font-size:12px;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:8px;">POST-TRIP INSPECTION</div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Students Transported:</strong> ${inspection.num_transported || "N/A"}</div>
      <div><strong>Total Hours:</strong> ${hoursStr}</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Odometer End:</strong> ${inspection.odometer_end || "N/A"}</div>
      <div><strong>Total Miles:</strong> ${totalMiles}</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Fuel End:</strong> ${inspection.end_fuel_level || "N/A"}</div>
      <div><strong>DEF End:</strong> ${inspection.end_def_level || "N/A"}</div>
    </div>
    <div style="margin:3px 0;"><strong>No Students Left on Bus:</strong> ${inspection.no_students_left ? "CONFIRMED ✓" : "NOT CONFIRMED"}</div>
    ${inspection.post_trip_concerns ? `<div style="margin-top:10px;"><strong>Post-Trip Concerns:</strong><div style="margin-top:5px;white-space:pre-wrap;">${inspection.post_trip_concerns}</div></div>` : ""}
    ${inspection.post_trip_remarks ? `<div style="margin-top:10px;"><strong>Condition Remarks:</strong><div style="margin-top:5px;white-space:pre-wrap;">${inspection.post_trip_remarks}</div></div>` : ""}
  </div>

  ${adminSection}

  <div style="margin:15px 0;border:2px solid ${statusColor};background:${statusBg};padding:10px;">
    <div style="font-weight:bold;font-size:12px;border-bottom:1px solid ${statusColor};padding-bottom:5px;margin-bottom:8px;">DAILY INSPECTION SUMMARY</div>
    <div style="display:flex;justify-content:space-between;margin:4px 0;">
      <div><strong>Total Miles Driven:</strong> ${totalMiles} miles</div>
      <div><strong>Total Hours:</strong> ${hoursStr}</div>
    </div>
    <div style="margin:3px 0;"><strong>Status:</strong> ${inspection.is_satisfactory ? "✓ Bus is Safe and Satisfactory" : "⚠ Defects Documented"} • ${inspection.no_students_left ? "✓ No Students Left on Bus" : "⚠ Student Check Incomplete"}</div>
    <div style="margin-top:12px;font-size:13px;font-weight:bold;padding-top:8px;border-top:1px solid ${statusColor};color:${cleared ? "#16a34a" : "#dc2626"};">
      ${cleared ? "✓ BUS CLEARED FOR NEXT ROUTE" : "✗ BUS NOT CLEARED FOR NEXT ROUTE — DEFECTS PRESENT — AWAITING MECHANIC INSPECTION &amp; CERTIFICATION"}
    </div>
  </div>

  ${mechSection}

  <div style="margin:15px 0;border:1px solid #000;padding:10px;">
    <div style="font-weight:bold;font-size:12px;border-bottom:1px solid #000;padding-bottom:5px;margin-bottom:8px;">CERTIFICATION</div>
    <p style="margin:10px 0;">I certify that the above vehicle has been inspected in accordance with NC state requirements and that all defects noted have been reported to my supervisor.</p>
    <div style="border-top:1px solid #000;width:200px;margin-top:30px;padding-top:5px;">Driver Signature</div>
    <div style="border-top:1px solid #000;width:200px;margin-top:40px;padding-top:5px;">Mechanic/Supervisor Signature</div>
  </div>

  <div style="margin-top:20px;border-top:2px solid #000;padding-top:10px;text-align:center;font-size:9px;">
    <p style="margin:2px 0;">This is a legal document. Retain for required recordkeeping period.</p>
    <p style="margin:2px 0;">Generated: ${formatInTimeZone(new Date(), "America/New_York", "MM/dd/yyyy HH:mm")}</p>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
      <FileText className="w-4 h-4" />
      Export Combined PDF
    </Button>
  );
}