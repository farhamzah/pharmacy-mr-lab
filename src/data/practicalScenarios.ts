export interface PracticalStep {
  id: string;
  label: string;
  description: string;
}

export type Difficulty = "basic" | "intermediate";
export type ModuleType = "weighing" | "mixing";

export interface PracticalScenario {
  id: string;
  moduleId: ModuleType;
  moduleType: ModuleType;
  moduleName: string;
  title: string;
  description: string;
  learningObjectives: string[];
  safetyNotes: string[];
  estimatedDurationMinutes: number;
  difficulty: Difficulty;
  requiredSteps: PracticalStep[];
}

export interface WeighingScenario extends PracticalScenario {
  moduleId: "weighing";
  moduleType: "weighing";
  materialName: string;
  targetMassGram: number;
  toleranceGram: number;
  unitDisplay: "g";
}

export interface MixingScenario extends PracticalScenario {
  moduleId: "mixing";
  moduleType: "mixing";
  ingredientA: string;
  ingredientB: string;
  requiredHomogeneity: number;
  expectedOrder: string[];
  note?: string;
}

const weighingSteps: PracticalStep[] = [
  { id: "placeWeighingBoat", label: "Place weighing boat", description: "Letakkan weighing boat di atas plate timbangan." },
  { id: "tareScale", label: "Tare scale", description: "Nolkan timbangan setelah weighing boat berada di plate." },
  { id: "addSample", label: "Add sample", description: "Tambahkan bahan sedikit demi sedikit." },
  { id: "confirmMass", label: "Confirm mass", description: "Konfirmasi massa ketika mendekati target." },
  { id: "finish", label: "Finish", description: "Selesaikan prosedur penimbangan." },
];

const mixingSteps: PracticalStep[] = [
  { id: "addIngredientA", label: "Add ingredient A", description: "Masukkan ingredient A ke mortar." },
  { id: "addIngredientB", label: "Add ingredient B", description: "Masukkan ingredient B sesuai urutan." },
  { id: "mixPowder", label: "Mix powder", description: "Campur serbuk dengan stamper." },
  { id: "checkHomogeneity", label: "Check homogeneity", description: "Pastikan homogenitas memenuhi target." },
  { id: "transferToContainer", label: "Transfer to container", description: "Pindahkan campuran ke wadah akhir." },
  { id: "finish", label: "Finish", description: "Selesaikan prosedur pencampuran." },
];

export const weighingScenarios: WeighingScenario[] = [
  {
    id: "weighing_paracetamol_500mg",
    moduleId: "weighing",
    moduleType: "weighing",
    moduleName: "Penimbangan Paracetamol 500 mg",
    title: "Penimbangan Paracetamol 500 mg",
    description: "Latihan menimbang Paracetamol dengan target 0.500 g.",
    learningObjectives: ["Menyiapkan weighing boat", "Melakukan tare", "Mencapai massa sesuai toleransi"],
    safetyNotes: ["Hindari menumpahkan serbuk", "Pastikan area kerja bersih"],
    estimatedDurationMinutes: 5,
    difficulty: "basic",
    materialName: "Paracetamol",
    targetMassGram: 0.5,
    toleranceGram: 0.005,
    unitDisplay: "g",
    requiredSteps: weighingSteps,
  },
  {
    id: "weighing_lactose_1g",
    moduleId: "weighing",
    moduleType: "weighing",
    moduleName: "Penimbangan Lactose 1 g",
    title: "Penimbangan Lactose 1 g",
    description: "Latihan menimbang eksipien Lactose dengan target 1.000 g.",
    learningObjectives: ["Mengontrol penambahan sample besar", "Membaca toleransi 0.010 g"],
    safetyNotes: ["Gunakan alat bersih", "Jangan meniup serbuk"],
    estimatedDurationMinutes: 6,
    difficulty: "basic",
    materialName: "Lactose",
    targetMassGram: 1,
    toleranceGram: 0.01,
    unitDisplay: "g",
    requiredSteps: weighingSteps,
  },
  {
    id: "weighing_talcum_250mg",
    moduleId: "weighing",
    moduleType: "weighing",
    moduleName: "Penimbangan Talcum 250 mg",
    title: "Penimbangan Talcum 250 mg",
    description: "Latihan presisi massa kecil dengan target 0.250 g.",
    learningObjectives: ["Menambah sample bertahap", "Menghindari overshoot pada massa kecil"],
    safetyNotes: ["Hindari debu serbuk", "Gunakan ruangan terang"],
    estimatedDurationMinutes: 7,
    difficulty: "intermediate",
    materialName: "Talcum",
    targetMassGram: 0.25,
    toleranceGram: 0.005,
    unitDisplay: "g",
    requiredSteps: weighingSteps,
  },
];

export const mixingScenarios: MixingScenario[] = [
  {
    id: "mixing_simple_powder",
    moduleId: "mixing",
    moduleType: "mixing",
    moduleName: "Pencampuran Serbuk Sederhana",
    title: "Pencampuran Serbuk Sederhana",
    description: "Latihan mencampur dua bahan sederhana.",
    learningObjectives: ["Menambahkan bahan sesuai urutan", "Mencapai homogenitas minimal 90%"],
    safetyNotes: ["Jaga serbuk tetap di mortar", "Gunakan gerakan mixing terkendali"],
    estimatedDurationMinutes: 6,
    difficulty: "basic",
    ingredientA: "Paracetamol",
    ingredientB: "Lactose",
    requiredHomogeneity: 90,
    expectedOrder: ["A", "B"],
    requiredSteps: mixingSteps,
  },
  {
    id: "mixing_paracetamol_lactose",
    moduleId: "mixing",
    moduleType: "mixing",
    moduleName: "Pencampuran Paracetamol dan Lactose",
    title: "Pencampuran Paracetamol dan Lactose",
    description: "Latihan mencampur zat aktif dengan eksipien.",
    learningObjectives: ["Menjaga urutan bahan", "Mengevaluasi homogenitas campuran"],
    safetyNotes: ["Hindari kontaminasi silang", "Bersihkan mortar sebelum digunakan"],
    estimatedDurationMinutes: 8,
    difficulty: "basic",
    ingredientA: "Paracetamol",
    ingredientB: "Lactose",
    requiredHomogeneity: 90,
    expectedOrder: ["A", "B"],
    requiredSteps: mixingSteps,
  },
  {
    id: "mixing_dilution_powder",
    moduleId: "mixing",
    moduleType: "mixing",
    moduleName: "Pencampuran Pengenceran Serbuk",
    title: "Pencampuran Pengenceran Serbuk",
    description: "Simulasi pencampuran pengenceran bertahap sederhana.",
    learningObjectives: ["Memahami pengenceran serbuk", "Mencapai homogenitas lebih tinggi"],
    safetyNotes: ["Tambahkan diluent bertahap", "Periksa homogenitas sebelum transfer"],
    estimatedDurationMinutes: 10,
    difficulty: "intermediate",
    ingredientA: "Active Ingredient",
    ingredientB: "Diluent",
    requiredHomogeneity: 95,
    expectedOrder: ["A", "B"],
    note: "Simulasi pencampuran pengenceran bertahap sederhana",
    requiredSteps: mixingSteps,
  },
];

export const practicalScenarios = [...weighingScenarios, ...mixingScenarios];
export const getWeighingScenario = (id?: string): WeighingScenario => weighingScenarios.find((scenario) => scenario.id === id) ?? weighingScenarios[0];
export const getMixingScenario = (id?: string): MixingScenario => mixingScenarios.find((scenario) => scenario.id === id) ?? mixingScenarios[0];
