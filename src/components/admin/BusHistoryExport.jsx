import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { DEFECT_LABEL_MAP } from "@/components/inspection/ChecklistData";

export default function BusHistoryExport({ busNumber, inspections }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bus ${busNumber} - Defects History</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              padding: 40px;
              background: #fff;
              color: #000;
              font-size: 12px;
            }
            .header {
              border: 2px solid #000;
              padding: 20px;
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            .header p {
              font-size: 14px;
              opacity: 0.8;
            }
            .record {
              border: 1px solid #000;
              padding: 15px;
              margin-bottom: 20px;
            }
            .record-header {
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
            }
            .field {
              margin-bottom: 8px;
            }
            .label {
              display: inline-block;
              width: 150px;
              opacity: 0.7;
            }
            .value {
              font-weight: bold;
            }
            .defects-list {
              margin-top: 10px;
              padding-left: 20px;
            }
            .no-data {
              text-align: center;
              padding: 40px;
              opacity: 0.5;
            }
            @media print {
              body { background: #fff; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const busInspections = inspections.filter(i => 
    i.bus_number === busNumber && !i.is_satisfactory
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2"
      >
        <FileText className="w-4 h-4" /> Export History
      </Button>

      <div ref={printRef} style={{ display: 'none' }}>
        <div className="header">
          <h1>═══ DEFECTS HISTORICAL REPORT ═══</h1>
          <p>BUS #{busNumber}</p>
          <p>New Hanover County Schools</p>
          <p>Generated: {format(new Date(), "PPP 'at' p")}</p>
        </div>

        {busInspections.length === 0 ? (
          <div className="no-data">
            ┌────────────────────────────────────┐<br/>
            │  NO DEFECTS REPORTED               │<br/>
            └────────────────────────────────────┘
          </div>
        ) : (
          busInspections.map((inspection, idx) => (
            <div key={inspection.id} className="record">
              <div className="record-header">
                <span>RECORD #{idx + 1}</span>
                <span>{format(new Date(inspection.created_date), "MM/dd/yyyy HH:mm")}</span>
              </div>
              
              <div className="field">
                <span className="label">DRIVER:</span>
                <span className="value">{inspection.driver_name || "N/A"}</span>
              </div>
              
              <div className="field">
                <span className="label">TYPE:</span>
                <span className="value">{inspection.inspection_type === "pre_trip" ? "PRE-TRIP" : "POST-TRIP"}</span>
              </div>
              
              <div className="field">
                <span className="label">STATUS:</span>
                <span className="value">
                  {inspection.is_satisfactory ? "✓ SATISFACTORY" : "✗ DEFECTS REPORTED"}
                </span>
              </div>

              {!inspection.is_satisfactory && (inspection.defects?.length > 0 || inspection.air_brake_checks?.length > 0) && (
                <div className="field">
                  <span className="label">DEFECTS:</span>
                  <div className="defects-list">
                    {inspection.defects?.map(defectId => (
                      <div key={defectId}>→ {DEFECT_LABEL_MAP[defectId] || defectId}</div>
                    ))}
                    {inspection.air_brake_checks?.map(checkId => (
                      <div key={checkId}>→ [AIR BRAKE] {DEFECT_LABEL_MAP[checkId] || checkId}</div>
                    ))}
                  </div>
                </div>
              )}

              {inspection.concerns && (
                <div className="field">
                  <span className="label">CONCERNS:</span>
                  <div className="value" style={{ marginTop: '5px', paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>
                    {inspection.concerns}
                  </div>
                </div>
              )}

              {inspection.post_trip_concerns && (
                <div className="field">
                  <span className="label">POST CONCERNS:</span>
                  <div className="value" style={{ marginTop: '5px', paddingLeft: '20px', whiteSpace: 'pre-wrap' }}>
                    {inspection.post_trip_concerns}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        <div style={{ marginTop: '40px', textAlign: 'center', opacity: '0.5', fontSize: '10px' }}>
          ═══════════════════════════════════════════════════════════<br/>
          END OF REPORT - TOTAL RECORDS: {busInspections.length}<br/>
          ═══════════════════════════════════════════════════════════
        </div>
      </div>
    </>
  );
}