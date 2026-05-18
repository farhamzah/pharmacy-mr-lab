import { TableCalibrationProfile, tableCalibrationProfiles } from "./TableCalibrationProfile";

const CALIBRATION_STORAGE_KEY = "pharmacy-mr-lab.object-scale.v1";

export class ScaleCalibrationManager {
  getProfile(): TableCalibrationProfile {
    try {
      const id = localStorage.getItem(CALIBRATION_STORAGE_KEY);
      return tableCalibrationProfiles.find((profile) => profile.id === id) ?? tableCalibrationProfiles[1];
    } catch {
      return tableCalibrationProfiles[1];
    }
  }

  setProfile(id: TableCalibrationProfile["id"]): TableCalibrationProfile {
    const profile = tableCalibrationProfiles.find((item) => item.id === id) ?? tableCalibrationProfiles[1];
    try {
      localStorage.setItem(CALIBRATION_STORAGE_KEY, profile.id);
    } catch {
      // Calibration is a convenience setting; failure should not block the lab.
    }
    return profile;
  }

  getObjectScale(): number {
    return this.getProfile().objectScale;
  }
}
