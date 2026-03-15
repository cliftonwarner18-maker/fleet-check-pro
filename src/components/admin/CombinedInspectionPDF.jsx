import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DEFECT_LABEL_MAP } from "@/components/inspection/ChecklistData";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export default function CombinedInspectionPDF({ inspection }) {
  const contentRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = contentRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Inspection Report - Bus #${inspection.bus_number}</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 11px; 
              line-height: 1.4;
              color: #000;
              margin: 0;
              padding: 20px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header h1 { 
              margin: 0; 
              font-size: 16px; 
              font-weight: bold;
            }
            .header p { 
              margin: 2px 0; 
              font-size: 10px; 
            }
            .section { 
              margin: 15px 0; 
              border: 1px solid #000;
              padding: 10px;
            }
            .section-title { 
              font-weight: bold; 
              font-size: 12px;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 8px;
            }
            .row { 
              display: flex; 
              justify-content: space-between;
              margin: 4px 0;
            }
            .field { 
              margin: 3px 0; 
            }
            .label { 
              font-weight: bold; 
            }
            .defect-list {
              margin-top: 5px;
              padding-left: 15px;
            }
            .defect-item {
              margin: 2px 0;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 200px;
              margin-top: 30px;
              padding-top: 5px;
            }
            .footer {
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 10px;
              text-align: center;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!inspection || inspection.inspection_type !== "combined") {
    return null;
  }

  return (
    <>
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
        <FileText className="w-4 h-4" />
        Export Combined PDF
      </Button>

      <div ref={contentRef} style={{ display: 'none' }}>
        <div className="header">
          <h1>DAILY VEHICLE INSPECTION REPORT</h1>
          <p>North Carolina School Bus - Pre-Trip & Post-Trip Combined</p>
          <p>New Hanover County Schools • Wilmington, NC</p>
        </div>

        <div className="section">
          <div className="section-title">VEHICLE & DRIVER INFORMATION</div>
          <div className="row">
            <div className="field"><span className="label">Driver:</span> {inspection.driver_name}</div>
            <div className="field"><span className="label">Date:</span> {formatInTimeZone(new Date(inspection.created_date), 'America/New_York', 'MM/dd/yyyy')}</div>
          </div>
          <div className="row">
            <div className="field"><span className="label">Bus Number:</span> {inspection.bus_number}</div>
            <div className="field"><span className="label">Route(s):</span> {inspection.route_numbers || 'N/A'}</div>
          </div>
          <div className="field">
            <span className="label">Bus Type:</span> {inspection.bus_type === 'ec' ? 'EC (Wheelchair/Handicapped)' : 'Standard School Bus'}
          </div>
        </div>

        <div className="section">
          <div className="section-title">PRE-TRIP INSPECTION</div>
          <div className="row">
            <div className="field"><span className="label">Status:</span> {inspection.is_satisfactory && (!inspection.defects || inspection.defects.length === 0) ? 'SATISFACTORY - No Defects' : 'DEFECTS REPORTED'}</div>
            <div className="field"><span className="label">Odometer Start:</span> {inspection.odometer_start || 'N/A'}</div>
          </div>
          <div className="row">
            <div className="field"><span className="label">Odometer End:</span> {inspection.odometer_end || 'N/A'}</div>
            <div className="field"><span className="label">Total Miles:</span> {inspection.odometer_start && inspection.odometer_end ? (parseFloat(inspection.odometer_end) - parseFloat(inspection.odometer_start)).toFixed(1) : 'N/A'}</div>
          </div>
          <div className="row">
            <div className="field"><span className="label">Fuel Start:</span> {inspection.start_fuel_level || 'N/A'}</div>
            <div className="field"><span className="label">DEF Start:</span> {inspection.start_def_level || 'N/A'}</div>
          </div>
          
          {inspection.defects && inspection.defects.length > 0 && (
            <>
              <div className="field" style={{ marginTop: '10px' }}>
                <span className="label">Reported Defects:</span>
              </div>
              <div className="defect-list">
                {inspection.defects.map((defect, idx) => (
                  <div key={idx} className="defect-item">
                    • {DEFECT_LABEL_MAP[defect] || defect}
                  </div>
                ))}
              </div>
            </>
          )}

          {inspection.air_brake_checks && inspection.air_brake_checks.length > 0 && (
            <>
              <div className="field" style={{ marginTop: '10px' }}>
                <span className="label">Air Brake (P.L.A.B.S.) Issues:</span>
              </div>
              <div className="defect-list">
                {inspection.air_brake_checks.map((check, idx) => (
                  <div key={idx} className="defect-item">
                    • {DEFECT_LABEL_MAP[check] || check}
                  </div>
                ))}
              </div>
            </>
          )}

          {inspection.concerns && (
            <div className="field" style={{ marginTop: '10px' }}>
              <span className="label">Pre-Trip Concerns:</span>
              <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{inspection.concerns}</div>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-title">POST-TRIP INSPECTION</div>
          <div className="row">
            <div className="field"><span className="label">Students Transported:</span> {inspection.num_transported || 'N/A'}</div>
            <div className="field"><span className="label">Total Hours:</span> {(() => {
              const created = new Date(inspection.created_date);
              const updated = new Date(inspection.updated_date || inspection.created_date);
              const diffMs = updated - created;
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              return diffMs > 0 ? `${hours}h ${minutes}m` : 'N/A';
            })()}</div>
          </div>
          <div className="row">
            <div className="field"><span className="label">Fuel End:</span> {inspection.end_fuel_level || 'N/A'}</div>
            <div className="field"><span className="label">DEF End:</span> {inspection.end_def_level || 'N/A'}</div>
          </div>
          <div className="field">
            <span className="label">No Students Left on Bus:</span> {inspection.no_students_left ? 'CONFIRMED ✓' : 'NOT CONFIRMED'}
          </div>

          {inspection.post_trip_concerns && (
            <div className="field" style={{ marginTop: '10px' }}>
              <span className="label">Post-Trip Concerns:</span>
              <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{inspection.post_trip_concerns}</div>
            </div>
          )}

          {inspection.post_trip_remarks && (
            <div className="field" style={{ marginTop: '10px' }}>
              <span className="label">Condition Remarks:</span>
              <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{inspection.post_trip_remarks}</div>
            </div>
          )}
        </div>

        {inspection.admin_notes && (
          <div className="section">
            <div className="section-title">ADMINISTRATIVE NOTES</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{inspection.admin_notes}</div>
          </div>
        )}

        <div className="section" style={{ background: '#f0fdf4', border: '2px solid #22c55e' }}>
          <div className="section-title">DAILY INSPECTION SUMMARY</div>
          <div className="row">
            <div className="field"><span className="label">Total Miles Driven:</span> {inspection.odometer_start && inspection.odometer_end ? (parseFloat(inspection.odometer_end) - parseFloat(inspection.odometer_start)).toFixed(1) : 'N/A'} miles</div>
            <div className="field"><span className="label">Total Hours:</span> {(() => {
              const created = new Date(inspection.created_date);
              const updated = new Date(inspection.updated_date || inspection.created_date);
              const diffMs = updated - created;
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              return diffMs > 0 ? `${hours}h ${minutes}m` : 'N/A';
            })()}</div>
          </div>
          <div className="field" style={{ marginTop: '8px' }}>
            <span className="label">Status:</span> {inspection.is_satisfactory ? '✓ Bus is Safe and Satisfactory' : '⚠ Defects Documented'} • {inspection.no_students_left ? '✓ No Students Left on Bus' : '⚠ Student Check Incomplete'}
          </div>
        </div>

        <div className="section">
          <div className="section-title">CERTIFICATION</div>
          <p style={{ margin: '10px 0' }}>
            I certify that the above vehicle has been inspected in accordance with NC state requirements
            and that all defects noted have been reported to my supervisor.
          </p>
          <div className="signature-line">
            Driver Signature
          </div>
          <div className="signature-line" style={{ marginTop: '40px' }}>
            Mechanic/Supervisor Signature
          </div>
        </div>

        <div className="footer">
          <p>This is a legal document. Retain for required recordkeeping period.</p>
          <p>Generated: {formatInTimeZone(new Date(), 'America/New_York', 'MM/dd/yyyy HH:mm')}</p>
        </div>
      </div>
    </>
  );
}