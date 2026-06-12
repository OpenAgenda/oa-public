import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import mapLocation, { mapLocationSummary } from '../api-v3/lib/mapLocation.js';

// Validate each mapped shape against the ACTUAL OpenAPI schema
// (LocationSummary / Location), with every component registered so internal
// $refs (LocationExtId, LocationAdditionalFields, LocalizedString) resolve.
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

const validateSummary = buildValidator('LocationSummary');
const validateFull = buildValidator('Location');

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

// A rich location as the service `public` projection returns it (Date
// objects, numeric state, decimal-string coordinates, extIds already
// converted by formatExtIds.afterRead, legacy keys to be dropped).
const richLocation = () => ({
  uid: 67890,
  slug: 'chateau-des-lebres_4421007',
  setUid: null,
  name: 'Château des Lèbres',
  address: 'Naves, 07140 Les Vans',
  city: 'Les Vans',
  adminLevel4: 'Les Vans',
  district: null,
  adminLevel6: null,
  region: 'Auvergne-Rhône-Alpes',
  adminLevel1: 'Auvergne-Rhône-Alpes',
  department: 'Ardèche',
  adminLevel2: 'Ardèche',
  adminLevel3: null,
  adminLevel5: null,
  postalCode: '07140',
  insee: '07334',
  countryCode: 'FR',
  latitude: '44.388303',
  longitude: '4.105528',
  timezone: 'Europe/Paris',
  description: { fr: 'Ancienne maison forte des comtes du Roure.' },
  access: {},
  image: 'https://cdn.openagenda.com/main/locations/67890.jpg',
  imageCredits: null,
  website: 'http://www.domainedeslebres.com/',
  email: null,
  phone: '0475363414',
  links: ['https://fr-fr.facebook.com/domainedeslebres/'],
  extIds: [{ key: 'legacy', value: '4421007' }],
  tags: [{ id: 2, label: 'Château, hôtel urbain, palais, manoir' }],
  siret: null,
  state: 1,
  createdAt: new Date('2017-10-30T14:21:07.000Z'),
  updatedAt: new Date('2019-04-29T15:40:33.000Z'),
  // legacy / internal keys that must NOT leak
  extId: '4421007',
  duplicateCandidates: [99],
  disqualifiedDuplicates: null,
  mergedIn: null,
  deleted: 0,
});

// The service `list` projection (detailed=false): identity + coordinates.
const listLocation = () => ({
  uid: 67890,
  name: 'Château des Lèbres',
  address: 'Naves, 07140 Les Vans',
  latitude: 44.388303,
  longitude: 4.105528,
  state: 0,
});

describe('90 - api-v3 unit - mapLocation', () => {
  describe('mapLocationSummary', () => {
    it('maps a list projection to a contract-valid LocationSummary', () => {
      const mapped = mapLocationSummary(listLocation());
      assertValid(validateSummary, mapped, 'LocationSummary');
      expect(mapped.uid).toBe(67890);
    });

    it('exposes state as the verified boolean', () => {
      expect(mapLocationSummary(listLocation()).verified).toBe(false);
      expect(mapLocationSummary({ ...listLocation(), state: 1 }).verified).toBe(
        true,
      );
    });

    it('nullifies an absent address', () => {
      const mapped = mapLocationSummary({
        ...listLocation(),
        address: undefined,
      });
      expect(mapped.address).toBeNull();
      assertValid(validateSummary, mapped, 'LocationSummary');
    });
  });

  describe('mapLocation (full)', () => {
    it('maps a public projection to a contract-valid Location', () => {
      const mapped = mapLocation(richLocation());
      assertValid(validateFull, mapped, 'Location');
      expect(mapped.uid).toBe(67890);
    });

    it('drops legacy and internal keys', () => {
      const mapped = mapLocation(richLocation());
      for (const key of [
        'extId',
        'tags',
        'duplicateCandidates',
        'disqualifiedDuplicates',
        'mergedIn',
        'deleted',
        'state',
        'adminLevel1',
        'adminLevel2',
        'adminLevel4',
        'adminLevel6',
      ]) {
        expect(mapped).not.toHaveProperty(key);
      }
    });

    it('exposes the legacy tags under additionalFields', () => {
      const mapped = mapLocation(richLocation());
      expect(mapped.additionalFields).toEqual({
        tags: [{ id: 2, label: 'Château, hôtel urbain, palais, manoir' }],
      });
    });

    it('coerces decimal-string coordinates to numbers and dates to ISO', () => {
      const mapped = mapLocation(richLocation());
      expect(mapped.latitude).toBe(44.388303);
      expect(mapped.longitude).toBe(4.105528);
      expect(mapped.createdAt).toBe('2017-10-30T14:21:07.000Z');
      expect(mapped.updatedAt).toBe('2019-04-29T15:40:33.000Z');
    });

    it('applies the empty-as-empty rule on a sparse location', () => {
      const sparse = {
        uid: 1,
        slug: 'sparse',
        name: 'Sparse',
        latitude: 1,
        longitude: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      const mapped = mapLocation(sparse);
      assertValid(validateFull, mapped, 'Location (sparse)');
      expect(mapped.description).toEqual({});
      expect(mapped.access).toEqual({});
      expect(mapped.links).toEqual([]);
      expect(mapped.extIds).toEqual([]);
      expect(mapped.additionalFields).toEqual({ tags: [] });
      expect(mapped.address).toBeNull();
      expect(mapped.image).toBeNull();
      expect(mapped.siret).toBeNull();
      expect(mapped.verified).toBe(false);
    });

    it('keeps a null extIds value null (legacy "null" values)', () => {
      const mapped = mapLocation({
        ...richLocation(),
        extIds: [{ key: 'import', value: null }],
      });
      expect(mapped.extIds).toEqual([{ key: 'import', value: null }]);
      assertValid(validateFull, mapped, 'Location (null extId value)');
    });
  });
});
