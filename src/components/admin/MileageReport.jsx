import React from "react";
import { Button } from "@/components/ui/button";
import { Gauge } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export default function MileageReport({ inspections, date }) {
  const displayDate = date || format(new Date(), "MM/dd/yyyy");

  const handlePrint = () => {
    // Only post_trip and combined entries with an odometer_end reading
    const postTripEntries = inspections.filter(
      (i) => (i.inspection_type === "post_trip" || i.inspection_type === "combined") && i.odometer_end
    );

    // Group by bus_number — keep last recorded entry per bus (highest odometer_end)
    const busMap = {};
    postTripEntries.forEach((insp) => {
      const existing = busMap[insp.bus_number];
      if (!existing || parseFloat(insp.odometer_end) > parseFloat(existing.odometer_end)) {
        busMap[insp.bus_number] = insp;
      }
    });

    const sortedBuses = Object.values(busMap).sort((a, b) =>
      a.bus_number.localeCompare(b.bus_number, undefined, { numeric: true })
    );

    const rows = sortedBuses.map((insp, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#fff" : "#f8f9fa"};">
        <td style="padding:10px 14px;font-weight:bold;font-size:13px;border:1px solid #dee2e6;">${insp.bus_number}</td>
        <td style="padding:10px 14px;font-size:13px;border:1px solid #dee2e6;">${insp.driver_name || "N/A"}</td>
        <td style="padding:10px 14px;font-size:13px;font-weight:bold;border:1px solid #dee2e6;text-align:right;">${parseFloat(insp.odometer_end).toLocaleString()} mi</td>
        <td style="padding:10px 14px;font-size:11px;color:#555;border:1px solid #dee2e6;">${
          insp.post_trip_datetime
            ? formatInTimeZone(new Date(insp.post_trip_datetime), "America/New_York", "h:mm a") + " ET"
            : insp.updated_date
            ? formatInTimeZone(new Date(insp.updated_date), "America/New_York", "h:mm a") + " ET"
            : "N/A"
        }</td>
      </tr>`).join("");

    const emptyMessage = sortedBuses.length === 0
      ? `<tr><td colspan="4" style="text-align:center;padding:30px;color:#888;font-style:italic;">No post-trip mileage recorded for this date.</td></tr>`
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
    <strong>Date:</strong> ${displayDate} &nbsp;|&nbsp; <strong>Total Buses Reported:</strong> ${sortedBuses.length}
  </div>
  <table>
    <thead>
      <tr>
        <th>Bus #</th>
        <th>Driver</th>
        <th style="text-align:right;">Last Recorded Mileage</th>
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