/**
 * HIPAA PHI Privacy Masking Utilities
 * 
 * Masks Protected Health Information (PHI) for display when
 * privacy mode is enabled. Compliant with HIPAA Safe Harbor
 * de-identification standard (§164.514(b)(2)).
 */

/** Mask a full name: "Marcus Vance" → "M***** V****" */
export function maskName(name: string): string {
  if (!name) return "●●●●●";
  return name
    .split(" ")
    .map((part) => (part.length > 0 ? part[0] + "●".repeat(Math.max(part.length - 1, 3)) : "●●●"))
    .join(" ");
}

/** Mask an MRN: "MRN-98421" → "MRN-●●●●●" */
export function maskMRN(mrn: string): string {
  if (!mrn) return "●●●-●●●●●";
  const prefix = mrn.split("-")[0] || "MRN";
  return `${prefix}-●●●●●`;
}

/** Mask a date of birth: "1972-04-14" → "●●●●-●●-●●" */
export function maskDOB(dob: string): string {
  if (!dob) return "●●●●-●●-●●";
  return "●●●●-●●-●●";
}

/** Mask a generic sensitive string: "Penicillin (Anaphylactoid)" → "P●●●●●●●●●" */
export function maskGeneric(text: string): string {
  if (!text) return "●●●●●";
  if (text.length <= 2) return "●●";
  return text[0] + "●".repeat(Math.min(text.length - 1, 8));
}

/** Mask an age: 54 → "●●" */
export function maskAge(age: number | string): string {
  return "●●";
}

/** Mask a room or location: "Ward A - Bed 03" → "Ward ● - Bed ●●" */
export function maskRoom(room: string): string {
  if (!room) return "●●●●●";
  return room.replace(/\d+/g, (match) => "●".repeat(match.length));
}

/**
 * Convenience wrapper: conditionally mask based on privacyMode flag.
 * Usage: privacyWrap(privacyMode, patientName, maskName)
 */
export function privacyWrap<T>(
  privacyMode: boolean,
  value: T,
  maskFn: (val: T) => string
): string | T {
  return privacyMode ? maskFn(value) : value;
}
