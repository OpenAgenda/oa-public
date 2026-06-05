import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import mapAgenda, {
  mapAgendaSummary,
  mapAgendaDetailed,
} from '../api-v3/lib/mapAgenda.js';

// Validate each mapped shape against the ACTUAL OpenAPI schema (AgendaSummary /
// AgendaDetailed / Agenda), with every component registered so internal $refs
// (AgendaNetworkRef, AgendaLocationSetRef) resolve.
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

const validateSummary = buildValidator('AgendaSummary');
const validateDetailed = buildValidator('AgendaDetailed');
const validateFull = buildValidator('Agenda');

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

// A rich `core` agenda as the SQL get returns it (Date objects, numeric official,
// resolved network/locationSet carrying an extra indexed field to be dropped).
const richAgenda = () => ({
  uid: 12345,
  slug: 'my-agenda',
  title: 'My Agenda',
  description: 'A description',
  image: 'https://cdn.openagenda.com/main/12345.jpg',
  official: 1,
  url: 'https://example.org',
  createdAt: new Date('2026-01-02T03:04:05.000Z'),
  updatedAt: new Date('2026-02-03T04:05:06.000Z'),
  officializedAt: null,
  private: 0,
  indexed: 1,
  network: { uid: 7, title: 'Net', formSchemaId: 99 },
  locationSet: { uid: 8, title: 'Set' },
});

describe('90 - api-v3 unit - mapAgenda', () => {
  describe('mapAgendaSummary', () => {
    it('matches the AgendaSummary schema with the base field set only', () => {
      const body = mapAgendaSummary(richAgenda());
      assertValid(validateSummary, body, 'AgendaSummary');
      expect(Object.keys(body).sort()).toEqual(
        ['description', 'image', 'official', 'slug', 'title', 'uid'].sort(),
      );
    });
  });

  describe('mapAgendaDetailed', () => {
    it('matches AgendaDetailed: base + createdAt + network + locationSet', () => {
      const body = mapAgendaDetailed(richAgenda());
      assertValid(validateDetailed, body, 'AgendaDetailed');
      expect(body.createdAt).toBe('2026-01-02T03:04:05.000Z');
      // Relations are reduced to { uid, title } — the extra formSchemaId drops.
      expect(body.network).toEqual({ uid: 7, title: 'Net' });
      expect(body.locationSet).toEqual({ uid: 8, title: 'Set' });
      // It must NOT carry the single-get-only fields.
      expect(body).not.toHaveProperty('url');
      expect(body).not.toHaveProperty('updatedAt');
      expect(body).not.toHaveProperty('private');
    });
  });

  describe('mapAgenda (full)', () => {
    it('matches the Agenda schema with the full field set', () => {
      const body = mapAgenda(richAgenda());
      assertValid(validateFull, body, 'Agenda');
      expect(body.url).toBe('https://example.org');
      expect(body.updatedAt).toBe('2026-02-03T04:05:06.000Z');
      expect(body.officializedAt).toBeNull();
      expect(body.private).toBe(false);
      expect(body.indexed).toBe(true);
    });
  });

  describe('coercions / empty-as-empty', () => {
    it('coerces official to a real boolean', () => {
      expect(mapAgendaSummary({ official: 1 }).official).toBe(true);
      expect(mapAgendaSummary({ official: 0 }).official).toBe(false);
      expect(mapAgendaSummary({ official: null }).official).toBe(false);
      expect(mapAgendaSummary({}).official).toBe(false);
    });

    it('emits null (not omitted) for absent nullable values', () => {
      // createdAt/updatedAt are non-nullable in the schema (always present in
      // real records), so a realistic sparse source still carries them; only
      // the genuinely-nullable fields are absent here.
      const body = mapAgenda({
        uid: 1,
        slug: 's',
        title: 't',
        createdAt: '2026-05-31T00:00:00.000Z',
        updatedAt: '2026-05-31T00:00:00.000Z',
      });
      assertValid(validateFull, body, 'Agenda (sparse source)');
      expect(body.description).toBeNull();
      expect(body.image).toBeNull();
      expect(body.url).toBeNull();
      expect(body.officializedAt).toBeNull();
      expect(body.network).toBeNull();
      expect(body.locationSet).toBeNull();
    });

    it('passes through createdAt already serialized as an ISO string', () => {
      const body = mapAgendaDetailed({
        uid: 1,
        slug: 's',
        title: 't',
        createdAt: '2026-05-31T00:00:00.000Z',
      });
      expect(body.createdAt).toBe('2026-05-31T00:00:00.000Z');
    });
  });
});
