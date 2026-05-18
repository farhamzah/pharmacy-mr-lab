export const MAX_TABLES = 1;
export const TABLE_STORAGE_KEY = "pharmacy-mr-lab.tables.v1";
export const TARGET_MASS_GRAMS = 0.5;
export const MASS_TOLERANCE_GRAMS = 0.005;
export const TARGET_HOMOGENEITY_PERCENT = 90;
export const APP_VERSION = "0.7.4-readable-scale";
export const DEBUG_PERFORMANCE = false;

export type TableRole =
  | "unassigned"
  | "shared-workbench"
  | "material-station"
  | "weighing-station"
  | "mixing-station";

export type ModuleId = "weighing" | "mixing";
