import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DEFECT_LABEL_MAP } from "@/components/inspection/ChecklistData";
import { base44 } from "@/api/base44Client";

export default function TD28DExport({ inspections, date }) {
  const printRef = useRef();
  const [buses, setBuses] = React.useState([]);

  React.useEffect(() => {
    base44.entities.Bus.filter({ is_active: true }, "bus_number").then(setBuses);
  }, []);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>TD-28D Bus Driver Sign-In Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
          .header-row { display: flex; gap: 30px; margin: 15px 0; font-size: 13px; }
          .header-row span { border-bottom: 1px solid #000; min-width: 200px; padding-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; font-size: 11px; }
          th { background: #f0f0f0; font-weight: bold; }
          .ok-cell { text-align: center; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const displayDate = date || format(new Date(), "MM/dd/yyyy");

  return (
    <div>
      <Button onClick={handlePrint} variant="outline" className="rounded-xl gap-2">
        <FileDown className="w-4 h-4" />
        Export TD-28D
      </Button>

      <div ref={printRef} style={{ display: "none" }}>
        <h1>TD-28D Bus Driver Sign-In Sheet</h1>
        <div className="header-row">
          <span><strong>SCHOOL:</strong> New Hanover County Schools</span>
          <span><strong>DATE:</strong> {displayDate}</span>
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
            {buses.map((bus) => {
              const insp = inspections.find(i => i.bus_number === bus.bus_number);
              if (insp) {
                const allDefects = [...(insp.defects || []), ...(insp.air_brake_checks || [])];
                const remarks = allDefects.length > 0
                  ? allDefects.map(d => DEFECT_LABEL_MAP[d] || d).join(", ")
                  : insp.concerns || "";
                return (
                  <tr key={bus.id}>
                    <td>{insp.bus_number}</td>
                    <td>{formatInTimeZone(new Date(insp.created_date), "America/New_York", "h:mm a")}</td>
                    <td className="ok-cell">{insp.is_satisfactory ? "✓" : ""}</td>
                    <td>{insp.num_transported || ""}</td>
                    <td>{remarks}</td>
                    <td>{insp.driver_name}</td>
                  </tr>
                );
              } else {
                return (
                  <tr key={bus.id}>
                    <td>{bus.bus_number}</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                );
              }
            })}
            {/* Fill additional empty rows if needed */}
            {Array.from({ length: Math.max(0, 20 - buses.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}