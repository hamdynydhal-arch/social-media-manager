/**
 * Demographic profile types and persistence
 *
 * Demographic data feeds the DemographicModulator which applies evidence-based
 * adjustments to synthesis dimension scores.  All fields are optional —
 * only collected fields contribute to adjustments (zero imputation forbidden).
 */

export type Gender         = 'male' | 'female' | 'other';
export type MaritalStatus  = 'single' | 'married' | 'divorced' | 'widowed';
export type ParentalPresence = 'present' | 'absent_early' | 'absent_late' | 'deceased';
export type BirthOrder     = 'firstborn' | 'middle' | 'lastborn' | 'only_child';

export interface DemographicProfile {
  age:              number           | null;
  gender:           Gender           | null;
  maritalStatus:    MaritalStatus    | null;
  numberOfChildren: number           | null;
  fatherPresence:   ParentalPresence | null;
  motherPresence:   ParentalPresence | null;
  birthOrder:       BirthOrder       | null;
  siblingsCount:    number           | null;
}

export const EMPTY_PROFILE: DemographicProfile = {
  age:              null,
  gender:           null,
  maritalStatus:    null,
  numberOfChildren: null,
  fatherPresence:   null,
  motherPresence:   null,
  birthOrder:       null,
  siblingsCount:    null,
};

const STORAGE_KEY = 'nafees_demographic_profile';

export function saveDemographicProfile(profile: DemographicProfile): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

export function loadDemographicProfile(): DemographicProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemographicProfile) : null;
  } catch { return null; }
}

export function clearDemographicProfile(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

/** Returns the number of non-null fields (max 8) */
export function profileCompleteness(p: DemographicProfile): number {
  return Object.values(p).filter((v) => v !== null).length;
}
