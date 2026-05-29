import {
  resolveAdditionalFieldSelections,
  mapFacets,
} from '../api-v3/lib/facets.js';

// Synthetic merged schema: two optioned fields (one public, one moderator-only),
// two numeric fields (one public, one admin-only), plus a native field (no
// schemaId) that must never be treated as an agenda field.
const schema = {
  fields: [
    {
      field: 'pubChoice',
      fieldType: 'select',
      schemaId: 1,
      label: { fr: 'Public' },
      options: [{ id: 'a', label: { fr: 'A' } }],
    },
    {
      field: 'modChoice',
      fieldType: 'select',
      schemaId: 1,
      read: ['moderator'],
      label: { fr: 'Mod' },
      options: [{ id: 'x', label: { fr: 'X' } }],
    },
    {
      field: 'pubNum',
      fieldType: 'number',
      schemaId: 1,
      read: [],
      label: { fr: 'Num' },
    },
    {
      field: 'adminNum',
      fieldType: 'integer',
      schemaId: 1,
      read: ['administrator'],
      label: { fr: 'AdminNum' },
    },
    { field: 'title', fieldType: 'select', schemaId: null, options: [] },
  ],
};

describe('90 - api-v3 - unit: additionalFields facet resolution', () => {
  describe('resolveAdditionalFieldSelections — read-access gate', () => {
    it('keeps only public-readable fields of each family for a public caller', () => {
      const sel = resolveAdditionalFieldSelections(schema, {
        countsKeys: null,
        metricsKeys: null,
        wantCounts: true,
        wantMetrics: true,
        access: 'public',
      });

      expect(sel.additionalFields.map((f) => f.field)).toEqual(['pubChoice']);
      expect(sel.additionalFieldMetrics.map((f) => f.field)).toEqual([
        'pubNum',
      ]);
    });

    const resolveError = (opts) => {
      try {
        resolveAdditionalFieldSelections(schema, opts);
      } catch (e) {
        return e;
      }
      return null;
    };

    it('rejects a restricted field named by a public caller (no existence leak)', () => {
      const err = resolveError({
        countsKeys: ['modChoice'],
        metricsKeys: null,
        wantCounts: true,
        wantMetrics: false,
        access: 'public',
      });

      expect(err?.name).toBe('BadRequest');
      expect(err.info.errors[0]).toEqual({
        field: 'additionalFieldsKeys',
        message: 'unknown additional field "modChoice"',
      });
    });

    it('exposes the restricted field to a caller with the matching access', () => {
      const sel = resolveAdditionalFieldSelections(schema, {
        countsKeys: ['modChoice'],
        metricsKeys: null,
        wantCounts: true,
        wantMetrics: false,
        access: 'moderator',
      });

      expect(sel.additionalFields.map((f) => f.field)).toEqual(['modChoice']);
    });

    it('rejects a field of the wrong family (a number named for counts)', () => {
      const err = resolveError({
        countsKeys: ['pubNum'],
        metricsKeys: null,
        wantCounts: true,
        wantMetrics: false,
        access: 'public',
      });

      expect(err?.name).toBe('BadRequest');
      expect(err.info.errors[0].message).toBe(
        'unknown additional field "pubNum"',
      );
    });

    it('aggregates the per-field errors into one BadRequest', () => {
      let err;
      try {
        resolveAdditionalFieldSelections(schema, {
          countsKeys: ['nope', 'modChoice'],
          metricsKeys: null,
          wantCounts: true,
          wantMetrics: false,
          access: 'public',
        });
      } catch (e) {
        err = e;
      }
      expect(err?.name).toBe('BadRequest');
      expect(err.info.errors).toHaveLength(2);
      expect(
        err.info.errors.every((e) => e.field === 'additionalFieldsKeys'),
      ).toBe(true);
    });
  });

  describe('mapFacets — schema-driven shapes', () => {
    const afSelections = {
      additionalFields: [
        { field: 'pubChoice', label: { fr: 'Public' } },
        { field: 'boolField', label: { fr: 'Bool' } },
      ],
      additionalFieldMetrics: [{ field: 'pubNum', label: { fr: 'Num' } }],
    };
    const aggregations = {
      'additionalFields:pubChoice': [
        { id: 'a', label: { fr: 'A' }, eventCount: 3 },
      ],
      // boolean buckets carry `key` (true/false) and no label
      'additionalFields:boolField': [{ key: 'true', eventCount: 2 }],
      'additionalFieldMetrics:pubNum': { sum: 10, avg: 5, max: 7, min: 3 },
    };

    it('maps option counts (choice + boolean) to { value, label, count }', () => {
      const { facets } = mapFacets(aggregations, ['additionalFields'], {
        afSelections,
      });

      expect(facets.additionalFields.pubChoice).toEqual({
        label: { fr: 'Public' },
        values: [{ value: 'a', label: { fr: 'A' }, count: 3 }],
      });
      // boolean: value from `key`, label null
      expect(facets.additionalFields.boolField.values).toEqual([
        { value: 'true', label: null, count: 2 },
      ]);
    });

    it('maps numeric metrics to { sum, avg, max, min }, nulls when absent', () => {
      const { facets } = mapFacets(
        { ...aggregations, 'additionalFieldMetrics:pubNum': {} },
        ['additionalFieldMetrics'],
        { afSelections },
      );

      expect(facets.additionalFieldMetrics.pubNum).toEqual({
        label: { fr: 'Num' },
        metrics: { sum: null, avg: null, max: null, min: null },
      });
    });
  });
});
