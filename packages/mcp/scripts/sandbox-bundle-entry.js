// Entry for the sandbox SDK bundle: tsdown bundles this file + ky + zod into one
// self-contained IIFE exposed as globalThis.__OA_SDK__ (see ../tsdown.config.ts).
//
// It wildcard-re-exports the whole @openagenda/api-client public surface, so the
// sandbox tracks the SDK automatically as the contract grows — no manual list to
// maintain. It's ALSO the seam for MCP-specific sandbox helpers: add an
// `export function …` / `export const …` here and it lands in __OA_SDK__,
// available to the executed code alongside the SDK.
export * from '@openagenda/api-client';
