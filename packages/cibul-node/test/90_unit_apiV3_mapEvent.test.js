import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import mapEvent, { mapEventSummary } from '../api-v3/lib/mapEvent.js';

// Load the OpenAPI doc and build Ajv validators for the EventSummary (list) and
// Event (single get) schemas, with all component schemas registered so internal
// `#/components/schemas/...` $refs resolve.
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

const validateEventSummary = buildValidator('EventSummary');
const validateEvent = buildValidator('Event');

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

// Base/detailed field classification (mirrors searchIncludes.json + the
// EventSummary/Event split). Used to assert presence per schema.
const BASE_REQUIRED = [
  'uid',
  'slug',
  'title',
  'description',
  'status',
  'dateRange',
  'featured',
  'image',
  'imageCredits',
  'keywords',
  'originAgenda',
  'location',
  'timezone',
  'attendanceMode',
  'onlineAccessLink',
  'firstTiming',
  'lastTiming',
  'nextTiming',
  'additionalFields',
];
const DETAILED_ONLY_REQUIRED = [
  // `timings` is detailed-only: the full occurrence array is stripped from the
  // light projection; the summary speaks dates through first/last/nextTiming.
  'timings',
  'longDescription',
  'conditions',
  'country',
  'registration',
  'createdAt',
  'updatedAt',
  'accessibility',
  'age',
  'state',
  'links',
  'extIds',
  'sourceAgendas',
];

// Real projected events captured from `core.agendas().events.search` (detailed),
// representative of what the v3 layer maps. These mirror the structures emitted
// by the ES projection: null/empty optional fields, internal keys to drop,
// nested `_agg`, a custom field `thematique`, a localized `country`/`dateRange`.
const projectedEvents = [
  {
    uid: 1,
    slug: 'event-1',
    state: 2,
    title: { fr: 'Evénement 1' },
    description: { fr: 'Description 1' },
    longDescription: { fr: 'Description longue 1' },
    keywords: [], // empty -> {} (map)
    conditions: null, // absent -> {} (map)
    image: null, // absent -> null
    age: null, // absent -> null
    accessibility: { ii: false, hi: false, vi: false, pi: false, mi: false },
    attendanceMode: 1,
    onlineAccessLink: null, // absent -> null (nullable scalar)
    status: 1,
    timings: [
      { begin: '2019-09-27T10:00:00+02:00', end: '2019-09-27T12:00:00+02:00' },
    ],
    registration: null, // absent -> [] (array)
    links: [],
    extIds: null, // absent -> [] (array)
    timezone: 'Europe/Paris',
    createdAt: '2022-06-01T14:00:00.000Z',
    updatedAt: '2026-05-22T07:27:55.000Z',
    dateRange: {
      fr: 'Vendredi 27 septembre 2019, 10h00',
      en: 'Friday 27 September 2019, 10:00',
    },
    firstTiming: {
      begin: '2019-09-27T08:00:00.000Z',
      end: '2019-09-27T10:00:00.000Z',
    },
    lastTiming: {
      begin: '2019-09-27T08:00:00.000Z',
      end: '2019-09-27T10:00:00.000Z',
    },
    nextTiming: null, // absent -> null
    featured: false,
    sourceAgendas: [],
    originAgenda: {
      uid: 1,
      title: 'Une commune de Fraaance',
      slug: 'une-commune-de-fraaance',
      image: null,
      url: null,
      official: false,
      _agg: 'eyJ1aWQiOjF9',
      private: 0,
      description: 'Une description',
    },
    location: {
      uid: 1,
      name: 'La boutique',
      address: '29 passage du ponceau, Paris',
      city: null,
      latitude: 48.867583,
      longitude: 2.350264,
      countryCode: null,
      timezone: 'Europe/Paris',
      _agg: 'eyJ1aWQiOjF9',
      disqualifiedDuplicates: null,
      tags: [{ id: 33, label: 'Première participation' }],
    },
    // internal/moderation keys that must be dropped
    motive: null,
    creatorUid: 1,
    ownerUid: 1,
    private: 0,
    draft: 0,
    valid: true,
    agendaUid: 1,
    // agenda-specific custom field
    thematique: 2,
  },
  {
    uid: 2,
    slug: 'event-2',
    state: 2,
    title: { fr: 'Evénement 2' },
    description: { fr: 'Description 2' },
    status: 1,
    attendanceMode: 1,
    timezone: 'Europe/Paris',
    createdAt: '2019-09-01T08:00:00.000Z',
    updatedAt: '2019-09-15T08:00:00.000Z',
    dateRange: { fr: 'x' },
    featured: false,
    keywords: [],
    country: {
      code: 'FR',
      fr: 'France (Métropole)',
      en: 'France (Metropolitan)',
    },
    registration: null,
    extIds: null,
    image: {
      filename: '6fc4cb9253e54f50a61a7cf81a2eb1c1.base.image.jpg',
      size: { width: 700, height: 717 },
      variants: [
        {
          filename: '6fc4cb9253e54f50a61a7cf81a2eb1c1.full.image.jpg',
          size: { width: 125, height: 128 },
          type: 'full',
        },
      ],
      base: 'https://cdn.openagenda.com/dev/',
    },
    imageCredits: 'Gaetan Latouche',
    links: [
      {
        link: 'https://www.calameo.com/read/x',
        data: { title: 'X', type: 'rich' },
      },
    ],
    timings: [
      { begin: '2019-09-27T10:00:00+02:00', end: '2019-09-27T12:00:00+02:00' },
    ],
    valid: true,
    thematique: 4,
  },
];

describe('90 - api-v3 unit - mapEvent / mapEventSummary', () => {
  describe('contract conformance (Ajv 2020 against openapi.yaml)', () => {
    for (const projected of projectedEvents) {
      it(`maps event ${projected.uid} to a contract-valid EventSummary`, () => {
        assertValid(
          validateEventSummary,
          mapEventSummary(projected),
          `EventSummary ${projected.uid}`,
        );
      });

      it(`maps event ${projected.uid} to a contract-valid Event`, () => {
        assertValid(
          validateEvent,
          mapEvent(projected),
          `Event ${projected.uid}`,
        );
      });
    }
  });

  describe('always-present rule: every required field present', () => {
    it('EventSummary contains all base fields (and only base + additionalFields)', () => {
      const summary = mapEventSummary(projectedEvents[0]);
      for (const key of BASE_REQUIRED) {
        expect(key in summary).toBe(true);
      }
      // detailed-only fields are NOT part of the summary view
      for (const key of DETAILED_ONLY_REQUIRED) {
        expect(key in summary).toBe(false);
      }
    });

    it('Event contains all base + detailed fields', () => {
      const event = mapEvent(projectedEvents[0]);
      for (const key of [...BASE_REQUIRED, ...DETAILED_ONLY_REQUIRED]) {
        expect(key in event).toBe(true);
      }
    });

    // The summary keeps `timezone` (needed to interpret first/last/nextTiming
    // across DST) but drops the full `timings` array (detailed-only). Regression
    // guard for the two EventSummary contract bugs.
    it('summary keeps timezone but not the full timings array', () => {
      const summary = mapEventSummary(projectedEvents[0]);
      expect(summary.timezone).toBe('Europe/Paris');
      expect('timings' in summary).toBe(false);
      // the compact date trio still carries the occurrence span
      expect('firstTiming' in summary).toBe(true);
      expect('nextTiming' in summary).toBe(true);
      // and the full array is present on the detailed Event
      expect(mapEvent(projectedEvents[0]).timings).toEqual(
        projectedEvents[0].timings,
      );
    });
  });

  describe('empty-as-empty rule', () => {
    it('empty/absent collections are [] / {} (never null, never omitted)', () => {
      const event = mapEvent(projectedEvents[0]);
      // arrays
      expect(event.registration).toEqual([]); // input null
      expect(event.extIds).toEqual([]); // input null
      expect(event.sourceAgendas).toEqual([]); // input []
      expect(event.links).toEqual([]); // input []
      // localized maps
      expect(event.keywords).toEqual({}); // input []
      expect(event.conditions).toEqual({}); // input null
    });

    it('singular-absent fields are present as null', () => {
      const event = mapEvent(projectedEvents[0]);
      expect(event.image).toBeNull();
      expect(event.age).toBeNull();
      expect(event.nextTiming).toBeNull();
      expect(event.onlineAccessLink).toBeNull(); // nullable scalar
      const summary = mapEventSummary(projectedEvents[0]);
      expect(summary.image).toBeNull();
      expect(summary.nextTiming).toBeNull();
    });

    it('country is null when no location country (Event only)', () => {
      const event = mapEvent(projectedEvents[0]);
      expect(event.country).toBeNull();
    });

    it('featured is always a boolean', () => {
      expect(mapEventSummary(projectedEvents[0]).featured).toBe(false);
      expect(mapEvent(projectedEvents[0]).featured).toBe(false);
    });

    it('populated collections are kept as-is', () => {
      const event = mapEvent(projectedEvents[1]);
      expect(event.country).toEqual({
        code: 'FR',
        fr: 'France (Métropole)',
        en: 'France (Metropolitan)',
      });
      expect(event.links).toHaveLength(1);
    });
  });

  describe('additionalFields separation', () => {
    it('routes non-native keys into additionalFields (Event)', () => {
      const event = mapEvent(projectedEvents[0]);
      expect(event.additionalFields).toBeDefined();
      expect(event.additionalFields.thematique).toBe(2);
    });

    it('additionalFields is present and excludes detailed natives on a summary', () => {
      const summary = mapEventSummary(projectedEvents[0]);
      // additionalFields is always present
      expect(summary.additionalFields).toBeDefined();
      // the agenda custom field is there
      expect(summary.additionalFields.thematique).toBe(2);
      // detailed-only native keys do NOT leak into summary.additionalFields
      for (const key of DETAILED_ONLY_REQUIRED) {
        expect(summary.additionalFields[key]).toBeUndefined();
      }
    });

    it('keeps native keys flat (not under additionalFields)', () => {
      const event = mapEvent(projectedEvents[0]);
      expect(event.uid).toBe(1);
      expect(event.title).toEqual({ fr: 'Evénement 1' });
      expect(event.additionalFields.uid).toBeUndefined();
      expect(event.additionalFields.title).toBeUndefined();
    });
  });

  describe('dropped internal/moderation keys', () => {
    const dropped = [
      'motive',
      'creatorUid',
      'ownerUid',
      'private',
      'draft',
      'valid',
      'agendaUid',
    ];

    it('never exposes internal keys at top level or under additionalFields', () => {
      for (const mapped of [
        mapEvent(projectedEvents[0]),
        mapEventSummary(projectedEvents[0]),
      ]) {
        for (const key of dropped) {
          expect(mapped[key]).toBeUndefined();
          expect(mapped.additionalFields[key]).toBeUndefined();
        }
      }
    });

    it('strips nested _agg from location and originAgenda (both views)', () => {
      for (const mapped of [
        mapEvent(projectedEvents[0]),
        mapEventSummary(projectedEvents[0]),
      ]) {
        expect(mapped.location._agg).toBeUndefined();
        expect(mapped.originAgenda._agg).toBeUndefined();
        // but keeps the meaningful nested data
        expect(mapped.location.name).toBe('La boutique');
        expect(mapped.originAgenda.uid).toBe(1);
      }
    });

    it('allowlists nested objects — no internal subfield leaks', () => {
      // projectedEvents[0] carries internal nested fields that must be dropped.
      const event = mapEvent(projectedEvents[0]);
      // location: only contract subfields survive
      expect(event.location.disqualifiedDuplicates).toBeUndefined();
      expect(event.location.tags).toBeUndefined();
      expect(event.location._agg).toBeUndefined();
      expect(event.location.name).toBe('La boutique');
      // originAgenda: only AgendaRef subfields survive
      expect(event.originAgenda.private).toBeUndefined();
      expect(event.originAgenda.description).toBeUndefined();
      expect(event.originAgenda._agg).toBeUndefined();
      expect(event.originAgenda.uid).toBe(1);
    });
  });
});
