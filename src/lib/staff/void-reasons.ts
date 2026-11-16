/** Why a charge is being voided. Staff pick one. "Other" needs a note; the rest can take one. */
export const VOID_REASONS = [
  { id: "wrong_patient", label: "Posted to the wrong patient" },
  { id: "wrong_details", label: "Wrong amount or description" },
  { id: "duplicate", label: "Duplicate charge" },
  { id: "not_provided", label: "Service wasn't provided" },
  { id: "not_billable", label: "Shouldn't be billed to the patient" },
  { id: "other", label: "Other" },
] as const;

export const VOID_NOTE_MAX = 200;

/** What is wrong with a chosen reason and note, or null if they can be saved. */
export function voidReasonProblem(reasonId: string, note: string): string | null {
  if (!VOID_REASONS.some((reason) => reason.id === reasonId)) return "Choose a reason.";
  if (note.trim().length > VOID_NOTE_MAX) return `Keep the note to ${VOID_NOTE_MAX} characters or fewer.`;
  if (reasonId === "other" && !note.trim()) return "Add a note that says why.";
  return null;
}

/** The reason as it is saved on the charge and in the activity log. Check it with `voidReasonProblem` first. */
export function voidReasonText(reasonId: string, note: string): string {
  const label = VOID_REASONS.find((reason) => reason.id === reasonId)?.label ?? "Other";
  return note.trim() ? `${label}: ${note.trim()}` : label;
}
