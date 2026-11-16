/** What a staff form says when its request never reached the server. */
export const CONNECTION_ERROR = "That didn't go through. Check your connection and try again.";

/** Builds the form a staff action expects from plain values. */
export function formDataOf(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(entries)) data.set(name, value);
  return data;
}
