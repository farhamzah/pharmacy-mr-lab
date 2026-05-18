export interface TableCalibrationProfile {
  id: "small" | "standard" | "large";
  label: string;
  objectScale: number;
  description: string;
}

export const tableCalibrationProfiles: TableCalibrationProfile[] = [
  { id: "small", label: "Small Lab Table", objectScale: 0.8, description: "Alat sedikit lebih kecil untuk meja sempit." },
  { id: "standard", label: "Standard Lab Table", objectScale: 1, description: "Ukuran standar untuk meja praktikum umum." },
  { id: "large", label: "Large Lab Table", objectScale: 1.2, description: "Alat lebih besar untuk meja luas atau demo kelas." },
];
