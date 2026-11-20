// Event status ids (`status` in the event schema).
export const POSTPONED = 4;
export const FULL = 5;
export const CANCELLED = 6;

// `status` arrives as an id, a numeric string, or `{ id, label }`; the server
// compares it the same way (`Number(value) === expected`).
export const statusIs = (event, expected) =>
  Number(event?.status?.id ?? event?.status) === expected;
