// Shared strict-gate primitives for the v3 query builders (events, agendas,
// locations). The contract they implement together: every documented filter
// is parsed and type-checked at the route layer, and an unknown or malformed
// value yields a single `400` aggregating ALL field errors under
// `error.details.errors`. Keeping the primitives here keeps the coercion
// rules (and their edge cases — blank strings, booleans, offset-less
// date-times) identical across the endpoints.
//
// `req.query` is parsed by `qs` (extended): repeated params are arrays, and
// bracketed params (`age[gte]`, `extId[key]`) are nested objects. Every leaf
// value is a string until coerced here.

import { BadRequest } from '@openagenda/verror';

export const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

export const asList = (v) => (Array.isArray(v) ? v : [v]);

const RANGE_BOUNDS = ['gte', 'lte'];

// RFC 3339 full-date, or date-time WITH an explicit offset. Offset-less
// date-times are rejected on purpose: Elasticsearch would read them as UTC
// where `new Date()` reads server-local time — the same input must not mean
// two instants depending on the endpoint.
// eslint-disable-next-line max-len
const RFC3339 = /^\d{4}-\d{2}-\d{2}(?:[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2}))?$/;

// Creates one validation context: `errors` accumulates `{ field, message }`
// entries across all the primitives, and `throwIfInvalid()` raises the single
// aggregated 400 at the end of the builder.
export default function createQueryGate() {
  const errors = [];

  const fail = (field, message) => errors.push({ field, message });

  const throwIfInvalid = () => {
    if (errors.length) {
      throw new BadRequest({ info: { errors } }, 'Invalid query parameters');
    }
  };

  const isScalar = (field, value) => {
    if (Array.isArray(value) || isPlainObject(value)) {
      fail(field, `${field} must be a single value`);
      return false;
    }
    return true;
  };

  // `Number('')` and `Number(' ')` are 0 — every numeric coercion below
  // rejects blanks explicitly so a dangling `uid=` or a blank bbox component
  // fails the gate instead of silently becoming 0.
  const isBlank = (raw) => String(raw).trim() === '';

  const toInt = (field, raw, message = `${field} must be an integer`) => {
    const n = Number(raw);
    if (typeof raw === 'boolean' || isBlank(raw) || !Number.isInteger(n)) {
      fail(field, message);
      return undefined;
    }
    return n;
  };

  const intList = (field, value) => {
    const out = [];
    const message = `${field} must be a list of integers`;
    for (const raw of asList(value)) {
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(field, message);
        continue;
      }
      const n = toInt(field, raw, message);
      if (n !== undefined) out.push(n);
    }
    return out;
  };

  const stringList = (field, value) => {
    const out = [];
    for (const raw of asList(value)) {
      if (typeof raw !== 'string') {
        fail(field, `${field} must be a list of strings`);
        continue;
      }
      out.push(raw);
    }
    return out;
  };

  const enumList = (field, value, allowed, { asInt = false } = {}) => {
    const out = [];
    for (const raw of asList(value)) {
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(field, `${field} has an invalid value`);
        continue;
      }
      const candidate = asInt ? Number(raw) : raw;
      if (
        (asInt && !Number.isInteger(candidate))
        || !allowed.includes(candidate)
      ) {
        fail(field, `${field} has an invalid value "${raw}"`);
        continue;
      }
      out.push(candidate);
    }
    return out;
  };

  const enumScalar = (field, value, allowed) => {
    if (!isScalar(field, value)) return undefined;
    if (!allowed.includes(value)) {
      fail(field, `${field} has an invalid value "${value}"`);
      return undefined;
    }
    return value;
  };

  const boolean = (field, value) => {
    if (!isScalar(field, value)) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    fail(field, `${field} must be true or false`);
    return undefined;
  };

  const number = (field, value, { min, max } = {}) => {
    if (!isScalar(field, value)) return undefined;
    const n = Number(value);
    if (typeof value === 'boolean' || isBlank(value) || Number.isNaN(n)) {
      fail(field, `${field} must be a number`);
      return undefined;
    }
    if ((min !== undefined && n < min) || (max !== undefined && n > max)) {
      fail(field, `${field} must be between ${min} and ${max}`);
      return undefined;
    }
    return n;
  };

  // A `createdAt[gte]=…`-style deepObject range. `kind: 'int'` validates
  // bounded integers; `kind: 'date'` validates strict RFC 3339 (see RFC3339
  // above — `Date.parse` alone accepts garbage like "March 13 2024").
  // `output: 'string'` forwards the validated string (Elasticsearch parses
  // it); `output: 'date'` constructs a Date for the SQL-backed services.
  const range = (field, value, { kind, min, max, output = 'string' } = {}) => {
    if (!isPlainObject(value)) {
      fail(field, `${field} must be a range object with gte and/or lte`);
      return undefined;
    }
    const out = {};
    for (const bound of Object.keys(value)) {
      if (!RANGE_BOUNDS.includes(bound)) {
        fail(`${field}.${bound}`, 'unknown range bound (use gte/lte)');
        continue;
      }
      const raw = value[bound];
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(`${field}.${bound}`, 'must be a single value');
        continue;
      }
      if (kind === 'int') {
        const n = toInt(`${field}.${bound}`, raw, 'must be an integer');
        if (n === undefined) continue;
        if ((min !== undefined && n < min) || (max !== undefined && n > max)) {
          fail(`${field}.${bound}`, `must be between ${min} and ${max}`);
          continue;
        }
        out[bound] = n;
      } else if (
        typeof raw !== 'string'
        || !RFC3339.test(raw)
        || Number.isNaN(Date.parse(raw))
      ) {
        fail(
          `${field}.${bound}`,
          'must be an RFC 3339 date-time with explicit offset, or a date',
        );
      } else {
        out[bound] = output === 'date' ? new Date(raw) : raw;
      }
    }
    return Object.keys(out).length ? out : undefined;
  };

  const keyValue = (field, value) => {
    if (!isPlainObject(value)) {
      fail(field, `${field} must be an object with key and value`);
      return undefined;
    }
    for (const k of Object.keys(value)) {
      if (k !== 'key' && k !== 'value') fail(`${field}.${k}`, 'unknown property');
    }
    if (typeof value.key !== 'string' || typeof value.value !== 'string') {
      fail(field, `${field} requires a string key and value`);
      return undefined;
    }
    return { key: value.key, value: value.value };
  };

  // "west,south,east,north" -> `{ northEast, southWest }` (decimal degrees,
  // WGS84) — the bounding-box convention shared by the events and locations
  // lists. Each coordinate goes through `number` so blanks are rejected.
  const parseBoundingBox = (field, value) => {
    if (!isScalar(field, value)) return undefined;
    const parts = String(value).split(',');
    if (parts.length !== 4) {
      fail(
        field,
        `${field} must be "west,south,east,north" in decimal degrees`,
      );
      return undefined;
    }
    const west = number(field, parts[0], { min: -180, max: 180 });
    const south = number(field, parts[1], { min: -90, max: 90 });
    const east = number(field, parts[2], { min: -180, max: 180 });
    const north = number(field, parts[3], { min: -90, max: 90 });
    if ([west, south, east, north].some((v) => v === undefined)) {
      return undefined;
    }
    return {
      northEast: { lat: north, lng: east },
      southWest: { lat: south, lng: west },
    };
  };

  return {
    errors,
    fail,
    throwIfInvalid,
    isScalar,
    toInt,
    intList,
    stringList,
    enumList,
    enumScalar,
    boolean,
    number,
    range,
    keyValue,
    parseBoundingBox,
  };
}
