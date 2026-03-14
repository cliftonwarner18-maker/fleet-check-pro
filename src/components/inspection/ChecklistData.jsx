// All 38 inspection items from NC Pre-Trip form
export const CHECKLIST_ITEMS = [
  { id: "1", label: "Brakes" },
  { id: "2", label: "Lights" },
  { id: "3", label: "Horn" },
  { id: "4", label: "Wipers" },
  { id: "5", label: "Gauges" },
  { id: "6", label: "Heaters" },
  { id: "7", label: "Defrosters" },
  { id: "8", label: "Seats" },
  { id: "9", label: "Engine" },
  { id: "10", label: "GPS" },
  { id: "11", label: "Windows / Windshield" },
  { id: "12", label: "Emergency Door / Exits" },
  { id: "13", label: "Emergency Equipment" },
  { id: "14", label: "Emergency Exit Buzzer" },
  { id: "15", label: "Steering" },
  { id: "16", label: "Tire Condition" },
  { id: "17", label: "Rims / Seals / Lug Nuts" },
  { id: "18", label: "Fluid Leaks" },
  { id: "19", label: "Transmission" },
  { id: "20", label: "Camera System" },
  { id: "21", label: "Air Leaks" },
  { id: "22", label: "Fuel Odor" },
  { id: "23", label: "Exhaust Fumes" },
  { id: "24", label: "Muffler / Tail Pipe / DPF" },
  { id: "25", label: "Student Mirror" },
  { id: "25b", label: "Backup Camera" },
  { id: "26", label: "Exterior Mirrors" },
  { id: "27", label: "Body Dents" },
  { id: "28", label: "Stop Sign" },
  { id: "29", label: "Crossing Arm" },
  { id: "30", label: "Child Alert" },
  { id: "31", label: "Air Conditioning" },
  { id: "31f", label: "A/C - Front" },
  { id: "31r", label: "A/C - Rear" },
  { id: "32", label: "Belt Cutter(s)" },
  { id: "32b", label: "First Aid Kit / Fluid Cleanup" },
  { id: "33", label: "Seat Belts" },
  { id: "34", label: "Car Seats - Built In" },
  { id: "35", label: "Safety Vests - EC" },
  { id: "36", label: "Wheelchair Student Strap System - EC" },
  { id: "37", label: "Wheelchair Lift - EC" },
  { id: "38", label: "Warning Lights" },
  { id: "38a", label: "Warning Lights - Amber" },
  { id: "38r", label: "Warning Lights - Red" },
];

export const PLABS_ITEMS = [
  { id: "P", label: "P - Parking Brake \"Hold Test\"" },
  { id: "L", label: "L - Leak Down" },
  { id: "A", label: "A - Alarms / Buzzers" },
  { id: "B", label: "B - Yellow \"Button\" Pop Out" },
  { id: "S", label: "S - Service Brake" },
];

export const FUEL_LEVELS = ["E", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "F"];

export const DEFECT_LABEL_MAP = {};
CHECKLIST_ITEMS.forEach(item => { DEFECT_LABEL_MAP[item.id] = item.label; });
PLABS_ITEMS.forEach(item => { DEFECT_LABEL_MAP[item.id] = item.label; });

export default CHECKLIST_ITEMS;