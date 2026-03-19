import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DEFECT_LABEL_MAP } from "@/components/inspection/ChecklistData";
import { base44 } from "@/api/base44Client";

export default function TD28DExport({ inspections, date }) {
  const [buses, setBuses] = React.useState([]);

  React.useEffect(() => {
    base44.entities.Bus.filter({ is_active: true }, "bus_number").then(setBuses);
  }, []);

  const displayDate = date || format(new Date(), "MM/dd/yyyy");

  const handlePrint = () => {
    const busRows = buses.map((bus) => {
      const busInspections = inspections.filter(i => i.bus_number === bus.bus_number);

      if (busInspections.length > 0) {
        const timeCell = busInspections.map((insp, idx) => {
          const arrivedTime = insp.post_trip_datetime
            ? formatInTimeZone(new Date(insp.post_trip_datetime), "America/New_York", "h:mm a") + " ET"
            : "&nbsp;";
          const border = idx < busInspections.length - 1 ? "border-bottom:1px solid #ccc;" : "";
          return `<div style="padding:6px 8px;${border}">${arrivedTime}</div>`;
        }).join("");

        const okCell = busInspections.map((insp, idx) => {
          const border = idx < busInspections.length - 1 ? "border-bottom:1px solid #ccc;" : "";
          return `<div style="padding:6px 8px;text-align:center;${border}">${insp.is_satisfactory ? "✓" : "&nbsp;"}</div>`;
        }).join("");

        const transportedCell = busInspections.map((insp, idx) => {
          const border = idx < busInspections.length - 1 ? "border-bottom:1px solid #ccc;" : "";
          return `<div style="padding:6px 8px;${border}">${insp.num_transported || "&nbsp;"}</div>`;
        }).join("");

        const remarksCell = busInspections.map((insp, idx) => {
          const allDefects = [...(insp.defects || []), ...(insp.air_brake_checks || [])];
          const defectLabels = allDefects.map(d => DEFECT_LABEL_MAP[d] || d).join(", ");
          const allRemarks = [defectLabels, insp.concerns || "", insp.post_trip_concerns || "", insp.post_trip_remarks || ""].filter(Boolean).join(" | ");
          const border = idx < busInspections.length - 1 ? "border-bottom:1px solid #ccc;" : "";
          return `<div style="padding:6px 8px;${border}">${allRemarks || "&nbsp;"}</div>`;
        }).join("");

        const driverCell = busInspections.map((insp, idx) => {
          const border = idx < busInspections.length - 1 ? "border-bottom:1px solid #ccc;" : "";
          return `<div style="padding:6px 8px;${border}">${insp.driver_name || "&nbsp;"}</div>`;
        }).join("");

        return `
          <tr>
            <td style="vertical-align:top;padding:6px 8px;">${bus.bus_number}</td>
            <td style="padding:0;">${timeCell}</td>
            <td style="padding:0;">${okCell}</td>
            <td style="padding:0;">${transportedCell}</td>
            <td style="padding:0;">${remarksCell}</td>
            <td style="padding:0;">${driverCell}</td>
          </tr>`;
      } else {
        return `
          <tr>
            <td>${bus.bus_number}</td>
            <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
          </tr>`;
      }
    }).join("");

    const emptyRows = Array.from({ length: Math.max(0, 20 - buses.length) })
      .map(() => `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`)
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>TD-28D Bus Driver Sign-In Sheet</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
    h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
    .header-row { display: flex; gap: 30px; margin: 15px 0; font-size: 13px; }
    .header-row span { border-bottom: 1px solid #000; min-width: 200px; padding-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #000; text-align: left; font-size: 11px; }
    th { background: #f0f0f0; font-weight: bold; padding: 6px 8px; }
    @media print { body { padding: 10px; } @page { margin: 0.5in; } }
  </style>
</head>
<body>
  <h1>TD-28D Bus Driver Sign-In Sheet</h1>
  <div class="header-row">
    <span><strong>SCHOOL:</strong> New Hanover County Schools</span>
    <span><strong>DATE:</strong> ${displayDate}</span>
    <span><strong>PRINCIPAL:</strong> ___________________</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>BUS NO</th>
        <th>TIME ARRIVED</th>
        <th>IF BUS IS O.K. HERE</th>
        <th>NO. TRANSPORTED</th>
        <th>REMARKS TO MECHANIC</th>
        <th>BUS DRIVER (SIGN)</th>
      </tr>
    </thead>
    <tbody>
      ${busRows}
      ${emptyRows}
    </tbody>
  </table>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline" className="rounded-xl gap-2">
      <FileDown className="w-4 h-4" />
      Export TD-28D
    </Button>
  );
}