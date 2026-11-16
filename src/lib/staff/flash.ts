/*
 * Messages that outlive a change of page. An action that ends by sending the
 * person somewhere else (signing in, saving a password) can't show a message
 * itself, so it leaves the message's code in a short-lived cookie and the next
 * page shows it once. Only a code travels: the words live here.
 */

export const FLASH_COOKIE = "staff_flash";
/** Where the cookie is sent, and how long the next page has to pick it up. */
export const FLASH_PATH = "/staff";
export const FLASH_SECONDS = 30;

export const FLASH_MESSAGES = {
  "signed-in": { title: "You're signed in", detail: undefined },
  "signed-out": { title: "You've signed out", detail: undefined },
  "admin-created": { title: "Admin account created", detail: "You're signed in. Add the rest of the team under Users." },
  "password-saved": { title: "Password saved", detail: "Anywhere else you were signed in has been signed out." },
  "patient-created": { title: "Patient account created", detail: "You can post their first charge now." },
} as const;

export type FlashCode = keyof typeof FLASH_MESSAGES;

export function isFlashCode(value: string): value is FlashCode {
  return Object.prototype.hasOwnProperty.call(FLASH_MESSAGES, value);
}
