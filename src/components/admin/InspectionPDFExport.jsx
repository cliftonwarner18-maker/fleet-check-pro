import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { DEFECT_LABEL_MAP, EC_ITEMS } from "@/components/inspection/ChecklistData";

export default function InspectionPDFExport({ inspection }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>${inspection.inspection_type === "pre_trip" ? "Pre" : "Post"}-Trip Inspection - Bus ${inspection.bus_number}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            font-size: 11px;
            max-width: 8.5in;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border: 2px solid #000;
            padding: 8px;
            margin-bottom: 10px;
          }
          .header h1 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: bold;
          }
          .header h2 {
            margin: 0;
            font-size: 12px;
            font-weight: bold;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 10px;
            font-size: 10px;
          }
          .info-row {
            display: flex;
            gap: 5px;
            align-items: baseline;
          }
          .info-row strong {
            min-width: 100px;
          }
          .info-row span {
            border-bottom: 1px solid #000;
            flex: 1;
            padding-bottom: 1px;
          }
          .fuel-section {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #000;
            font-size: 10px;
          }
          .fuel-row {
            display: flex;
            gap: 20px;
            margin: 4px 0;
          }
          .checklist {
            margin: 10px 0;
            border: 2px solid #000;
            padding: 10px;
          }
          .checklist-header {
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
            font-size: 11px;
            text-transform: uppercase;
          }
          .checklist-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px 12px;
            font-size: 9px;
          }
          .checklist-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .checkbox {
            width: 12px;
            height: 12px;
            border: 1.5px solid #000;
            display: inline-block;
            text-align: center;
            line-height: 10px;
            font-weight: bold;
          }
          .checkbox.checked::after {
            content: "X";
          }
          .plabs-section {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #000;
          }
          .plabs-row {
            display: flex;
            gap: 15px;
            font-size: 9px;
          }
          .concerns-section {
            margin: 10px 0;
            border: 1px solid #000;
            padding: 8px;
          }
          .concerns-section strong {
            display: block;
            margin-bottom: 4px;
            font-size: 10px;
          }
          .concerns-section p {
            margin: 0;
            min-height: 40px;
            font-size: 9px;
            line-height: 1.4;
          }
          .disclosure {
            margin: 10px 0;
            padding: 10px;
            border: 2px solid #000;
            background: #f9f9f9;
            font-size: 9px;
            line-height: 1.3;
          }
          .disclosure strong {
            font-size: 10px;
            text-transform: uppercase;
          }
          .signature-section {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }
          .signature-box {
            flex: 1;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
            font-size: 10px;
          }
          .satisfactory-box {
            margin: 10px 0;
            padding: 10px;
            border: 2px solid #000;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
          }
          @media print { 
            body { padding: 10px; }
            @page { margin: 0.5in; }
          }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const allDefects = [...(inspection.defects || []), ...(inspection.air_brake_checks || [])];
  const isPre = inspection.inspection_type === "pre_trip";

  return (
    <>
      <Button onClick={handlePrint} variant="outline" size="sm" className="rounded-lg gap-2">
        <FileText className="w-4 h-4" />
        Print {isPre ? "Pre" : "Post"}-Trip Form
      </Button>

      <div ref={printRef} style={{ display: "none" }}>
        <div className="header">
          <h1>North Carolina Public Schools</h1>
          <h2>* SCHOOL/ACTIVITY BUS {isPre ? "PRE" : "POST"}-TRIP INSPECTION REPORT *</h2>
        </div>

        <div className="info-section">
          <div className="info-row">
            <strong>District:</strong>
            <span>New Hanover County</span>
          </div>
          <div className="info-row">
            <strong>City:</strong>
            <span>Wilmington</span>
          </div>
          <div className="info-row">
            <strong>Driver:</strong>
            <span>{inspection.driver_name}</span>
          </div>
          <div className="info-row">
            <strong>Date/Time:</strong>
            <span>{format(new Date(inspection.created_date), "MM/dd/yyyy  •  hh:mm a")}</span>
          </div>
          <div className="info-row">
            <strong>Bus #:</strong>
            <span>{inspection.bus_number}</span>
          </div>
          <div className="info-row">
            <strong>Route #'s:</strong>
            <span>{inspection.route_numbers || "N/A"}</span>
          </div>
          <div className="info-row">
            <strong>Odometer {isPre ? "Start" : "End"}:</strong>
            <span>{isPre ? inspection.odometer_start : inspection.odometer_end}</span>
          </div>
          <div className="info-row">
            <strong>Bus Type:</strong>
            <span style={{ textTransform: "uppercase" }}>
              {inspection.bus_type === "ec" ? "EC" : inspection.bus_type === "activity" ? "ACTIVITY" : "REGULAR"}
            </span>
          </div>
        </div>

        <div className="fuel-section">
          <div className="fuel-row">
            <strong>{isPre ? "Start" : "End of Day"} Fuel Level:</strong>
            <span>( E | | | | 1/2 | | | | F ) = {isPre ? inspection.start_fuel_level || "___" : inspection.end_fuel_level || "___"}</span>
          </div>
          <div className="fuel-row">
            <strong>{isPre ? "Start" : "End of Day"} DEF Level:</strong>
            <span>( E | | | | 1/2 | | | | F ) = {isPre ? inspection.start_def_level || "___" : inspection.end_def_level || "___"}</span>
          </div>
          {!isPre && inspection.num_transported && (
            <div className="fuel-row">
              <strong>No. Transported:</strong>
              <span>{inspection.num_transported}</span>
            </div>
          )}
        </div>

        {inspection.is_satisfactory ? (
          <div className="satisfactory-box">
            ✓ VEHICLE {isPre ? "PRE" : "POST"}-TRIP SATISFACTORY
            <div style={{ fontSize: "9px", marginTop: "4px", fontWeight: "normal" }}>
              No defects or issues reported
            </div>
          </div>
        ) : (
          <>
            <div className="checklist">
              <div className="checklist-header">
                * {isPre ? "PRE" : "POST"}-TRIP INSPECTION * ( ONLY CHECK BOX IF AN ISSUE IS PRESENT )
              </div>
              <div className="checklist-grid">
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("1") ? "checkbox checked" : "checkbox"}></span>
                  <span>1. Brakes</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("11") ? "checkbox checked" : "checkbox"}></span>
                  <span>11. Windows; Windshield</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("21") ? "checkbox checked" : "checkbox"}></span>
                  <span>21. Air Leaks</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("2") ? "checkbox checked" : "checkbox"}></span>
                  <span>2. Lights</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("12") ? "checkbox checked" : "checkbox"}></span>
                  <span>12. Emergency Door/Exits</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("22") ? "checkbox checked" : "checkbox"}></span>
                  <span>22. Fuel Odor</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("3") ? "checkbox checked" : "checkbox"}></span>
                  <span>3. Horn</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("13") ? "checkbox checked" : "checkbox"}></span>
                  <span>13. Emergency Equipment</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("23") ? "checkbox checked" : "checkbox"}></span>
                  <span>23. Exhaust Fumes</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("4") ? "checkbox checked" : "checkbox"}></span>
                  <span>4. Wipers</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("14") ? "checkbox checked" : "checkbox"}></span>
                  <span>14. Emergency Exit Buzzer</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("24") ? "checkbox checked" : "checkbox"}></span>
                  <span>24. Muffler; Tail Pipe, DPF</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("5") ? "checkbox checked" : "checkbox"}></span>
                  <span>5. Gauges</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("15") ? "checkbox checked" : "checkbox"}></span>
                  <span>15. Steering</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("25") ? "checkbox checked" : "checkbox"}></span>
                  <span>25. Student Mirror</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("6") ? "checkbox checked" : "checkbox"}></span>
                  <span>6. Heaters</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("16") ? "checkbox checked" : "checkbox"}></span>
                  <span>16. Tire condition</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("26") ? "checkbox checked" : "checkbox"}></span>
                  <span>26. Exterior Mirrors</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("7") ? "checkbox checked" : "checkbox"}></span>
                  <span>7. Defrosters</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("17") ? "checkbox checked" : "checkbox"}></span>
                  <span>17. Rims; Seals; Lug nuts</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("27") ? "checkbox checked" : "checkbox"}></span>
                  <span>27. Body Dents</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("8") ? "checkbox checked" : "checkbox"}></span>
                  <span>8. Seats</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("18") ? "checkbox checked" : "checkbox"}></span>
                  <span>18. Fluid Leaks</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("28") ? "checkbox checked" : "checkbox"}></span>
                  <span>28. Stop Sign</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("9") ? "checkbox checked" : "checkbox"}></span>
                  <span>9. Engine</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("19") ? "checkbox checked" : "checkbox"}></span>
                  <span>19. Transmission</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("29") ? "checkbox checked" : "checkbox"}></span>
                  <span>29. Crossing Arm</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("10") ? "checkbox checked" : "checkbox"}></span>
                  <span>10. GPS</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("20") ? "checkbox checked" : "checkbox"}></span>
                  <span>20. Camera System</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("30") ? "checkbox checked" : "checkbox"}></span>
                  <span>30. Child Alert</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("31") ? "checkbox checked" : "checkbox"}></span>
                  <span>31. Air Conditioning</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("32") ? "checkbox checked" : "checkbox"}></span>
                  <span>32. Belt Cutter(s)</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("38") ? "checkbox checked" : "checkbox"}></span>
                  <span>38. Warning Lights</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("33") ? "checkbox checked" : "checkbox"}></span>
                  <span>33. Seat Belts</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("34") ? "checkbox checked" : "checkbox"}></span>
                  <span>34. Car Seats-Built In</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("35") ? "checkbox checked" : "checkbox"}></span>
                  <span>35. Safety Vests-EC</span>
                </div>
                <div className="checklist-item">
                  <span className={inspection.defects?.includes("36") ? "checkbox checked" : "checkbox"}></span>
                  <span>36. Wheelchair Strap System-EC</span>
                </div>
                <div className="checklist-item">
                   <span className={inspection.defects?.includes("37") ? "checkbox checked" : "checkbox"}></span>
                   <span>37. Wheelchair Lift-EC</span>
                 </div>
                </div>
                </div>

                {inspection.bus_type === "ec" && (
                <div className="checklist">
                 <div className="checklist-header">
                   * ADDITIONAL EC BUS EQUIPMENT *
                 </div>
                 <div className="checklist-grid">
                   {EC_ITEMS.map((item) => (
                     <div key={item.id} className="checklist-item">
                       <span className={inspection.defects?.includes(item.id) ? "checkbox checked" : "checkbox"}></span>
                       <span>{item.id}. {item.label}</span>
                     </div>
                   ))}
                 </div>
                </div>
                )}

                {isPre && (
              <div className="plabs-section">
                <strong>When Pre Trip Inspecting a bus equipped with "Air Brakes" Remember P.L.A.B.S.</strong>
                <div className="plabs-row">
                  <div className="checklist-item">
                    <span className={inspection.air_brake_checks?.includes("P") ? "checkbox checked" : "checkbox"}></span>
                    <span>P - Parking Brake "Hold Test"</span>
                  </div>
                  <div className="checklist-item">
                    <span className={inspection.air_brake_checks?.includes("L") ? "checkbox checked" : "checkbox"}></span>
                    <span>L - Leak Down</span>
                  </div>
                  <div className="checklist-item">
                    <span className={inspection.air_brake_checks?.includes("A") ? "checkbox checked" : "checkbox"}></span>
                    <span>A - Alarms /Buzzers</span>
                  </div>
                  <div className="checklist-item">
                    <span className={inspection.air_brake_checks?.includes("B") ? "checkbox checked" : "checkbox"}></span>
                    <span>B - Yellow "Button" Pop Out</span>
                  </div>
                  <div className="checklist-item">
                    <span className={inspection.air_brake_checks?.includes("S") ? "checkbox checked" : "checkbox"}></span>
                    <span>S - Service Brake</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {isPre && inspection.concerns && (
          <div className="concerns-section">
            <strong>Concerns:</strong>
            <p>{inspection.concerns}</p>
          </div>
        )}

        {!isPre && (
          <>
            {inspection.post_trip_concerns && (
              <div className="concerns-section">
                <strong>Post Trip Concerns:</strong>
                <p>{inspection.post_trip_concerns}</p>
              </div>
            )}
            {inspection.post_trip_remarks && (
              <div className="concerns-section">
                <strong>Post Trip Condition Remarks:</strong>
                <p>{inspection.post_trip_remarks}</p>
              </div>
            )}
            {inspection.no_students_left && (
              <div className="satisfactory-box" style={{ background: "#f0fdf4", borderColor: "#22c55e" }}>
                ✓ Post-Trip: No Students were left on the bus
              </div>
            )}
          </>
        )}

        <div className="disclosure">
          <strong>Commercial Vehicle Safety Disclosure</strong><br/>
          <strong>Do Not Operate this vehicle if safety is in question.</strong><br/>
          Operating any Commercial Vehicle with prior knowledge of defects could result in "Injury" or "Death" as well as 
          the potential of legal trouble in the event of an Accident/Incident.
        </div>

        <div className="signature-section">
          <div className="signature-box">
            <strong>Bus Driver Signature:</strong> X_______________________________
          </div>
          <div className="signature-box">
            <strong>Type:</strong> [ {isPre ? "X" : " "} ] Pre-Trip  [ {isPre ? " " : "X"} ] Post-Trip
          </div>
        </div>

        {inspection.admin_notes && (
          <div className="concerns-section" style={{ marginTop: "10px" }}>
            <strong>Admin / Mechanic Notes:</strong>
            <p>{inspection.admin_notes}</p>
          </div>
        )}
      </div>
    </>
  );
}