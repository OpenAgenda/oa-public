import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import mapAgendaOverview from '../api-v3/lib/mapAgendaOverview.js';

// Validate the mapped overview against the ACTUAL OpenAPI AgendaOverview schema
// (and its sub-schemas EventScopeStats / RecentlyAddedStats / Viewport, all
// registered so internal $refs resolve).
const specPath = fileURLToPath(
  import.meta.resolve('@openagenda/api-spec/openapi.yaml'),
);
const spec = parse(readFileSync(specPath, 'utf8'));

function buildValidator(ref) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(spec, 'openapi');
  return ajv.getSchema(`openapi#/components/schemas/${ref}`);
}

const validateOverview = buildValidator('AgendaOverview');

function assertValid(validate, body, label) {
  const ok = validate(body);
  if (!ok) {
    throw new Error(
      `${label} failed schema:\n${JSON.stringify(validate.errors, null, 2)}`
        + `\nmapped:\n${JSON.stringify(body, null, 2)}`,
    );
  }
  expect(ok).toBe(true);
}

// A scope bundle as `loadOverview` returns it (already reduced to maps).
const publishedScope = () => ({
  total: 28727,
  locations: 456,
  creators: 79,
  timeline: { current: 27, passed: 7, upcoming: 28693 },
  byLanguage: { fr: 28100, en: 627 },
  bySource: { contribution: 879, shared: 0, aggregation: 27848 },
  byEndDay: { '2026-06-17': 12, '2026-06-18': 30 },
  laterDays: 28685,
  viewport: {
    topLeft: { latitude: 51.09, longitude: -5.14 },
    bottomRight: { latitude: 41.33, longitude: 9.56 },
  },
  keywords: ['Paris', 'Théâtre', 'Culture'],
});

const allScope = () => ({
  total: 1248000,
  timeline: { current: 30, passed: 900000, upcoming: 348000 },
  byLanguage: { fr: 1200000, en: 48000 },
  bySource: { contribution: 50000, shared: 12, aggregation: 1198000 },
  byEndDay: { '2026-06-17': 40 },
  laterDays: 347900,
  viewport: null,
  byState: { '-1': 5000, 1: 200000, 2: 1043000 },
  keywords: ['Lyon', 'Concert'],
});

const recentlyAdded = () => ({
  window: 14,
  bySource: { contribution: 12, shared: 0, aggregation: 3 },
});

describe('90 - api-v3 unit - mapAgendaOverview', () => {
  describe('public caller (no `all` scope)', () => {
    it('matches AgendaOverview and omits events.all entirely', () => {
      const body = mapAgendaOverview({
        published: publishedScope(),
        all: null,
        recentlyAdded: recentlyAdded(),
      });

      assertValid(validateOverview, body, 'AgendaOverview (public)');
      // The gated scope is ABSENT, not null/empty.
      expect(body.events).not.toHaveProperty('all');
      expect(Object.keys(body.events)).toEqual(['published']);
      // Published carries the distinct counts...
      expect(body.events.published.locations).toBe(456);
      expect(body.events.published.creators).toBe(79);
      // ...and NOT the all-only byState.
      expect(body.events.published).not.toHaveProperty('byState');
      expect(body.recentlyAdded).toEqual(recentlyAdded());
    });
  });

  describe('privileged caller (with `all` scope)', () => {
    it('matches AgendaOverview and emits both scopes', () => {
      const body = mapAgendaOverview({
        published: publishedScope(),
        all: allScope(),
        recentlyAdded: recentlyAdded(),
      });

      assertValid(validateOverview, body, 'AgendaOverview (privileged)');
      expect(Object.keys(body.events).sort()).toEqual(['all', 'published']);
      // The all scope carries byState and a null viewport, and NOT the
      // published-only distinct counts.
      expect(body.events.all.byState).toEqual({
        '-1': 5000,
        1: 200000,
        2: 1043000,
      });
      expect(body.events.all.viewport).toBeNull();
      expect(body.events.all).not.toHaveProperty('locations');
      expect(body.events.all).not.toHaveProperty('creators');
    });
  });

  describe('defensive normalisation', () => {
    it('fills a sparse loader output with empty-as-empty defaults', () => {
      const body = mapAgendaOverview({
        published: {},
        all: null,
        recentlyAdded: {},
      });

      assertValid(validateOverview, body, 'AgendaOverview (sparse)');
      expect(body.events.published.total).toBe(0);
      expect(body.events.published.timeline).toEqual({
        current: 0,
        passed: 0,
        upcoming: 0,
      });
      expect(body.events.published.byLanguage).toEqual({});
      expect(body.events.published.viewport).toBeNull();
      expect(body.events.published.keywords).toEqual([]);
      expect(body.recentlyAdded).toEqual({ window: 0, bySource: {} });
    });

    it('coerces a partial viewport to null', () => {
      const body = mapAgendaOverview({
        published: { ...publishedScope(), viewport: { topLeft: {} } },
        all: null,
        recentlyAdded: recentlyAdded(),
      });
      assertValid(validateOverview, body, 'AgendaOverview (partial viewport)');
      expect(body.events.published.viewport).toBeNull();
    });
  });
});
