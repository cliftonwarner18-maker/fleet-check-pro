import React from "react";
import { Button } from "@/components/ui/button";
import { Gauge } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { base44 } from "@/api/base44Client";

export default function MileageReport({ inspections, date }) {
  const [buses, setBuses] = React.useState([]);

  React.useEffect(() => {
    base44.entities.Bus.filter({ is_active: true }, "bus_number").then(setBuses);
  }, []);

  const displayDate = date || format(new Date(), "MM/dd/yyyy");

  const handlePrint = () => {
    // Build a map of post-trip data keyed by bus_number
    const postTripEntries = inspections.filter(
      (i) => (i.inspection_type === "post_trip" || i.inspection_type === "combined") && i.odometer_end
    );
    const busMap = {};
    postTripEntries.forEach((insp) => {
      const existing = busMap[insp.bus_number];
      if (!existing || parseFloat(insp.odometer_end) > parseFloat(existing.odometer_end)) {
        busMap[insp.bus_number] = insp;
      }
    });

    const rows = buses.map((bus, idx) => {
      const insp = busMap[bus.bus_number];
      const mileageCell = insp
        ? `<strong>${parseFloat(insp.odometer_end).toLocaleString()} mi</strong>`
        : `<span style="color:#bbb;">___________</span>`;
      const driverCell = insp ? (insp.driver_name || "N/A") : `<span style="color:#bbb;">___________</span>`;
      const odomStart = insp && insp.odometer_start ? parseFloat(insp.odometer_start) : null;
      const odomEnd = insp && insp.odometer_end ? parseFloat(insp.odometer_end) : null;
      const startCell = odomStart != null
        ? `${odomStart.toLocaleString()} mi`
        : `<span style="color:#bbb;">___________</span>`;
      const milesCell = (odomStart != null && odomEnd != null && odomEnd >= odomStart)
        ? `<strong style="color:#1B3A5C;">${(odomEnd - odomStart).toFixed(1)} mi</strong>`
        : `<span style="color:#bbb;">___________</span>`;
      const timeCell = insp
        ? (insp.post_trip_datetime
            ? formatInTimeZone(new Date(insp.post_trip_datetime), "America/New_York", "h:mm a") + " ET"
            : insp.updated_date
            ? formatInTimeZone(new Date(insp.updated_date), "America/New_York", "h:mm a") + " ET"
            : "N/A")
        : `<span style="color:#bbb;">___________</span>`;
      return `<tr style="background:${idx % 2 === 0 ? "#fff" : "#f8f9fa"}">
        <td style="padding:10px 14px;font-weight:bold;font-size:13px;border:1px solid #dee2e6;">${bus.bus_number}</td>
        <td style="padding:10px 14px;font-size:13px;border:1px solid #dee2e6;">${driverCell}</td>
        <td style="padding:10px 14px;font-size:13px;border:1px solid #dee2e6;text-align:right;">${startCell}</td>
        <td style="padding:10px 14px;font-size:13px;border:1px solid #dee2e6;text-align:right;">${mileageCell}</td>
        <td style="padding:10px 14px;font-size:13px;border:1px solid #dee2e6;text-align:right;">${milesCell}</td>
        <td style="padding:10px 14px;font-size:11px;color:#555;border:1px solid #dee2e6;">${timeCell}</td>
      </tr>`;
    }).join("");

    const emptyMessage = buses.length === 0
      ? `<tr><td colspan="6" style="text-align:center;padding:30px;color:#888;font-style:italic;">No buses found in fleet.</td></tr>`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Daily Mileage Report - ${displayDate}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; color: #000; }
    h1 { text-align: center; font-size: 20px; margin: 0 0 4px 0; }
    .subtitle { text-align: center; font-size: 12px; color: #444; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #1B3A5C; color: #fff; padding: 10px 14px; text-align: left; font-size: 12px; border: 1px solid #1B3A5C; }
    th:last-child { text-align: right; }
    .footer { margin-top: 20px; font-size: 10px; color: #777; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
    @media print { body { padding: 10px; } @page { margin: 0.5in; } }
  </style>
</head>
<body>
  <h1>Daily Mileage Report</h1>
  <div class="subtitle">
    New Hanover County Schools • Wilmington, NC<br/>
    <strong>Date:</strong> ${displayDate} &nbsp;|&nbsp; <strong>Total Buses:</strong> ${buses.length} &nbsp;|&nbsp; <strong>With Mileage:</strong> ${Object.keys(busMap).length}
  </div>
  <table>
    <thead>
      <tr>
        <th>Bus #</th>
        <th>Driver</th>
        <th style="text-align:right;">Odometer Start</th>
        <th style="text-align:right;">Odometer End</th>
        <th style="text-align:right;">Miles Traveled</th>
        <th>Post-Trip Time</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      ${emptyMessage}
    </tbody>
  </table>
  <div class="footer">
    For use by fuel truck personnel — reflects last known odometer reading from post-trip submissions on ${displayDate}.<br/>
    Generated: ${formatInTimeZone(new Date(), "America/New_York", "MM/dd/yyyy h:mm a")} ET • FleetCheck Pro
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <Button onClick={handlePrint} variant="outline" className="rounded-xl gap-2">
      <Gauge className="w-4 h-4" />
      Mileage Report
    </Button>
  );
}