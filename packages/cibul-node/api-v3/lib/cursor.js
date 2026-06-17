// Opaque cursor encoding for the v3 API.
//
// `core` exposes pagination as a raw Elasticsearch `search_after` array (the
// stringified sort values of the last hit) plus the `sort` that produced it.
// The public contract hides that internal shape behind an opaque string, so we
// base64url-encode the `{ after, sort }` pair. Decoding restores the pair so we
// can feed it back into the search `nav` (`after`) and `options`/`query` (`sort`).

import { BadRequest } from '@openagenda/verror';

export function encodeCursor({ after, sort }) {
  if (after == null) {
    return null;
  }

  const json = JSON.stringify({ after, sort: sort ?? null });
  return Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeCursor(cursor) {
  if (cursor == null || cursor === '') {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(
      Buffer.from(String(cursor), 'base64url').toString('utf8'),
    );
  } catch {
    throw new BadRequest('invalid "after" cursor');
  }

  const isPrimitive = (v) =>
    v === null || ['string', 'number', 'boolean'].includes(typeof v);

  if (
    parsed == null
    || typeof parsed !== 'object'
    || !Array.isArray(parsed.after)
    || parsed.after.length === 0
    || !parsed.after.every(isPrimitive)
  ) {
    throw new BadRequest('invalid "after" cursor');
  }

  return { after: parsed.after, sort: parsed.sort ?? null };
}

// The SQL-keyset lists (locations, /me/agendas) position on a single integer
// row key. Gate the element type here so a forged-but-decodable cursor fails
// as the contract 400 instead of reaching a service whose validators throw
// non-Error shapes the error handler can't map.
export function decodeIntCursor(cursor) {
  const decoded = decodeCursor(cursor);

  if (decoded == null) {
    return null;
  }

  if (decoded.after.length !== 1 || !Number.isInteger(decoded.after[0])) {
    throw new BadRequest('invalid "after" cursor');
  }

  return decoded.after[0];
}
