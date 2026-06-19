---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Make the v3 `limit` query parameter reject out-of-contract values instead of silently clamping them.

A `limit` outside `[1, 100]` (e.g. the v2-era `300`) or a non-integer was previously coerced — clamped to the bound, or reset to the default — and the request still returned `200`. A truncated page looks complete to the caller, hiding data with no signal. It is now a `400` with a per-field error, consistent with the `detailed`/`sort` gate (an out-of-contract value is a bad request, not a coerced one). The `100` cap is enforced as declared: bulk/sync reads page through the cursor (`after`), which is safe at any depth (no offset `max_result_window`), rather than requesting one oversized page.

Spec change is documentation-only (the `Limit` schema already declared `minimum: 1` / `maximum: 100`); the enforcement is server-side. No SDK type change.
