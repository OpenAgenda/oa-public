import {
  resolveFields,
  pickSelected,
  selectionToIncludes,
  applyProjection,
  selectsTop,
  fieldNamesOf,
} from '../api-v3/lib/selectFields.js';
import {
  buildFieldTree,
  EVENT_FIELD_TREE,
  AGENDA_FIELD_TREE,
  LOCATION_FIELD_TREE,
  ME_FIELD_TREE,
} from '../api-v3/lib/specFieldTree.js';
import mapEvent, { EVENT_SELECT } from '../api-v3/lib/mapEvent.js';
import { mapAgendaDetailed, AGENDA_SELECT } from '../api-v3/lib/mapAgenda.js';
import mapLocation, { LOCATION_SELECT } from '../api-v3/lib/mapLocation.js';

// Unit coverage for the v3 `?fields=` sparse selector. The gate
// (`resolveFields`, total nested-leaf validation against the spec-derived tree),
// the trimmer (`pickSelected`), the tree builder (`buildFieldTree`) and the
// generic store pushdown translation (`selectionToIncludes`) are pure — no
// container needed.

function expect400(fn) {
  try {
    fn();
  } catch (err) {
    expect(err.name).toBe('BadRequest');
    expect(err.info?.errors?.[0]?.field).toBe('fields');
    return err;
  }
  throw new Error('expected resolveFields to throw a 400');
}

// A throwaway tree marking every name OPEN — enough for the trim tests, which
// only need resolveFields to BUILD the selection Set (validation is exercised
// against the real spec tree separately).
const openTree = (names) => Object.fromEntries(names.map((n) => [n, true]));

describe('api-v3 selectFields', () => {
  describe('buildFieldTree (spec → field tree)', () => {
    // A self-contained schema set exercising every shape the resolver unwraps.
    const schemas = {
      Root: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'integer' },
          title: { $ref: '#/components/schemas/LocalizedString' },
          nullableRef: {
            oneOf: [{ $ref: '#/components/schemas/Ref' }, { type: 'null' }],
          },
          composed: { allOf: [{ $ref: '#/components/schemas/Ref' }] },
          list: {
            type: 'array',
            items: { $ref: '#/components/schemas/Ref' },
          },
          bag: { $ref: '#/components/schemas/OpenBag' },
        },
      },
      Ref: {
        type: 'object',
        additionalProperties: false,
        properties: { uid: { type: 'integer' }, name: { type: 'string' } },
      },
      LocalizedString: {
        type: 'object',
        additionalProperties: { type: 'string' },
      },
      OpenBag: {
        type: 'object',
        properties: { known: { type: 'string' } },
        additionalProperties: true,
      },
    };

    const tree = buildFieldTree(schemas, 'Root');

    test('scalar → closed leaf (no descent)', () => {
      expect(tree.id).toEqual({});
    });
    test('localized map ($ref to additionalProperties map) → OPEN', () => {
      expect(tree.title).toBe(true);
    });
    test('unwraps oneOf:[ref, null] to the ref', () => {
      expect(tree.nullableRef).toEqual({ uid: {}, name: {} });
    });
    test('unwraps allOf:[ref]', () => {
      expect(tree.composed).toEqual({ uid: {}, name: {} });
    });
    test('array descends into its items', () => {
      expect(tree.list).toEqual({ uid: {}, name: {} });
    });
    test('object with truthy additionalProperties → OPEN (even with properties)', () => {
      expect(tree.bag).toBe(true);
    });
  });

  describe('spec-derived trees stay in lockstep with their mappers', () => {
    // The contract is the single source of truth for validation; these guards
    // fail fast if the spec and a mapper drift — a top-level field, a nested
    // keyset, or the open/closed nature of a node disagreeing.
    test('event universe = the Event mapper key set', () => {
      expect(Object.keys(EVENT_FIELD_TREE).sort()).toEqual(
        Object.keys(mapEvent({})).sort(),
      );
    });
    test('agenda universe = the AgendaDetailed mapper key set', () => {
      expect(Object.keys(AGENDA_FIELD_TREE).sort()).toEqual(
        Object.keys(mapAgendaDetailed({})).sort(),
      );
    });
    test('location universe = the Location mapper key set', () => {
      expect(Object.keys(LOCATION_FIELD_TREE).sort()).toEqual(
        Object.keys(mapLocation({})).sort(),
      );
    });
    test('/me universe = the agenda shape + grafted role/private', () => {
      const meKeys = [...Object.keys(mapAgendaDetailed({})), 'private', 'role'];
      expect(Object.keys(ME_FIELD_TREE).sort()).toEqual(meKeys.sort());
    });

    test('event nested keysets match the keys the mapper emits', () => {
      // Probe each mapper-allowlisted (CLEANERS) field with an over-populated
      // nested value; the emitted sub-keys must equal the spec tree's children —
      // so a renamed/dropped key in either source fails here.
      const fill = (keys) =>
        Object.fromEntries([...keys, '__extra__'].map((k) => [k, 1]));

      for (const field of ['location', 'originAgenda', 'image']) {
        const childKeys = Object.keys(EVENT_FIELD_TREE[field]);
        const emitted = mapEvent({ [field]: fill(childKeys) })[field];
        expect(Object.keys(emitted).sort()).toEqual([...childKeys].sort());
      }
      for (const field of [
        'sourceAgendas',
        'registration',
        'links',
        'extIds',
      ]) {
        const childKeys = Object.keys(EVENT_FIELD_TREE[field]);
        const emitted = mapEvent({ [field]: [fill(childKeys)] })[field][0];
        expect(Object.keys(emitted).sort()).toEqual([...childKeys].sort());
      }
    });

    test('agenda + location nested keysets match the mappers', () => {
      const agendaNetwork = mapAgendaDetailed({
        network: { uid: 1, title: 't', __extra__: 9 },
      }).network;
      expect(Object.keys(agendaNetwork).sort()).toEqual(
        Object.keys(AGENDA_FIELD_TREE.network).sort(),
      );

      const locationExtId = mapLocation({
        extIds: [{ key: 'k', value: 'v', __extra__: 9 }],
      }).extIds[0];
      expect(Object.keys(locationExtId).sort()).toEqual(
        Object.keys(LOCATION_FIELD_TREE.extIds).sort(),
      );
    });

    test('the contract open containers are OPEN nodes', () => {
      // The additional-fields bag and localized text maps are
      // `additionalProperties: true` in the contract → best-effort leaves.
      expect(EVENT_FIELD_TREE.additionalFields).toBe(true);
      expect(EVENT_FIELD_TREE.title).toBe(true); // LocalizedString
      expect(EVENT_FIELD_TREE.location.country).toBe(true); // nested localized
      expect(LOCATION_FIELD_TREE.additionalFields).toBe(true);
      expect(LOCATION_FIELD_TREE.description).toBe(true);
    });

    test('closed nested objects stay strict (deep)', () => {
      // image.variants is a closed object → its leaves are validated.
      expect(EVENT_FIELD_TREE.image.variants).toEqual({
        type: {},
        filename: {},
        size: { width: {}, height: {} },
      });
    });
  });

  describe('fieldNamesOf', () => {
    test('mirrors the mapper key set (used by the /me pushdown strip)', () => {
      const names = fieldNamesOf(mapAgendaDetailed);
      expect(names).toEqual(Object.keys(mapAgendaDetailed({})));
    });
    test('appends route-grafted names (e.g. /me role/private)', () => {
      const names = fieldNamesOf(mapAgendaDetailed, ['private', 'role']);
      expect(names).toContain('role');
      expect(names).toContain('private');
    });
  });

  describe('resolveFields', () => {
    const tree = EVENT_FIELD_TREE;

    test('absent → null (no trimming)', () => {
      expect(resolveFields(undefined, tree)).toBeNull();
    });

    test('CSV list → Set of names, uid always retained', () => {
      const selected = resolveFields('title,location', tree);
      expect([...selected].sort()).toEqual(['location', 'title', 'uid']);
    });

    test('a detailed-only field is selectable over the full universe', () => {
      const selected = resolveFields('longDescription', tree);
      expect([...selected].sort()).toEqual(['longDescription', 'uid']);
    });

    test('dotted paths are accepted (each segment validated)', () => {
      const selected = resolveFields('location.name,location.city', tree);
      expect([...selected].sort()).toEqual([
        'location.city',
        'location.name',
        'uid',
      ]);
    });

    test('a dotted path under an UNKNOWN top-level segment → 400', () => {
      const err = expect400(() => resolveFields('nope.deep', tree));
      expect(err.info.errors[0].message).toContain('nope.deep');
    });

    test('repeated param (qs array) is accepted too', () => {
      const selected = resolveFields(['title', 'location'], tree);
      expect(selected.has('title')).toBe(true);
      expect(selected.has('location')).toBe(true);
      expect(selected.has('uid')).toBe(true);
    });

    test('whitespace and empty tokens are tolerated', () => {
      const selected = resolveFields(' title , , location ', tree);
      expect([...selected].sort()).toEqual(['location', 'title', 'uid']);
    });

    test('unknown field (not in the universe) → 400 naming the offender', () => {
      const err = expect400(() => resolveFields('title,nope', tree));
      expect(err.info.errors[0].message).toContain('nope');
    });

    test('empty value → 400', () => {
      expect(expect400(() => resolveFields('', tree)).name).toBe('BadRequest');
      expect(expect400(() => resolveFields('  ,  ', tree)).name).toBe(
        'BadRequest',
      );
    });

    test('bracketed/object form → 400', () => {
      const err = expect400(() => resolveFields({ gte: 'title' }, tree));
      expect(err.info.errors[0].message).toContain('comma-separated');
    });

    describe('total strict nested leaves (from the spec tree)', () => {
      test('a known nested leaf is accepted', () => {
        expect(resolveFields('location.name', tree).has('location.name')).toBe(
          true,
        );
      });

      test('an unknown nested leaf at a closed level → 400', () => {
        const err = expect400(() => resolveFields('location.zzz', tree));
        expect(err.info.errors[0].message).toContain('location.zzz');
      });

      test('a leaf under an OPEN field (the bag) stays best-effort', () => {
        expect(
          resolveFields('additionalFields.myCustom', tree).has(
            'additionalFields.myCustom',
          ),
        ).toBe(true);
      });

      test('a leaf under a localized map (title) stays best-effort', () => {
        expect(resolveFields('title.fr', tree).has('title.fr')).toBe(true);
      });

      test('a closed pass-through object IS validated (age is strict now)', () => {
        // `age` has no mapper allowlist, but the contract (AgeRange) is closed.
        expect(resolveFields('age.min', tree).has('age.min')).toBe(true);
        expect400(() => resolveFields('age.zzz', tree));
      });

      test('validation is TOTAL — a deep closed leaf is checked', () => {
        // image.variants is a closed object: a bad deep leaf 400s, a good one
        // passes — the previous "only the first nested segment" leniency is gone.
        expect(
          resolveFields('image.variants.type', tree).has('image.variants.type'),
        ).toBe(true);
        const err = expect400(() => resolveFields('image.variants.zzz', tree));
        expect(err.info.errors[0].message).toContain('image.variants.zzz');
      });

      test('a dotted leaf under a scalar → 400', () => {
        // `uid` is a scalar — it has no sub-fields.
        const err = expect400(() => resolveFields('uid.x', tree));
        expect(err.info.errors[0].message).toContain('uid.x');
      });
    });

    describe('prototype-member names are not valid fields', () => {
      // The spec trees are plain objects; membership MUST be own-key, never a
      // bare index that resolves inherited `Object.prototype` members and waves
      // them through as a 200 where the contract mandates a 400.
      test.each(['toString', 'constructor', '__proto__', 'hasOwnProperty'])(
        'top-level %s → 400',
        (name) => {
          expect400(() => resolveFields(name, tree));
        },
      );

      test('nested prototype member at a closed level → 400', () => {
        const err = expect400(() =>
          resolveFields('location.constructor', tree));
        expect(err.info.errors[0].message).toContain('location.constructor');
      });
    });

    describe('malformed (empty-segment) paths → 400', () => {
      // A trailing/empty dotted segment is rejected at every level, OPEN
      // included — `title.` used to be accepted and silently emptied the map.
      test.each(['title.', 'a..b', 'location.', '.title'])(
        '%s → 400',
        (path) => {
          const err = expect400(() => resolveFields(path, tree));
          expect(err.info.errors[0].message).toContain('malformed');
        },
      );
    });
  });

  describe('selectionToIncludes (generic store pushdown)', () => {
    test('events: dotted paths kept, derived timing pulls the array', () => {
      const includes = selectionToIncludes(
        new Set(['uid', 'location.name', 'nextTiming']),
        EVENT_SELECT,
      );
      expect(includes).toContain('location.name');
      expect(includes).toContain('nextTiming');
      expect(includes).toContain('timings');
    });

    test('events: a custom field flattens out of the bag', () => {
      const includes = selectionToIncludes(
        new Set(['uid', 'additionalFields.myField']),
        EVENT_SELECT,
      );
      expect(includes).toContain('myField');
      expect(includes).not.toContain('additionalFields.myField');
    });

    test('events: the bare bag bails to null without enumerated keys', () => {
      expect(
        selectionToIncludes(new Set(['uid', 'additionalFields']), EVENT_SELECT),
      ).toBeNull();
    });

    test('events: the bare bag with an EMPTY bagKeys array also bails to null', () => {
      expect(
        selectionToIncludes(new Set(['uid', 'additionalFields']), {
          ...EVENT_SELECT,
          bagKeys: [],
        }),
      ).toBeNull();
    });

    test('events: the bare bag expands to the supplied bagKeys', () => {
      const includes = selectionToIncludes(
        new Set(['uid', 'additionalFields']),
        { ...EVENT_SELECT, bagKeys: ['fieldA', 'fieldB'] },
      );
      expect(includes).toEqual(
        expect.arrayContaining(['uid', 'fieldA', 'fieldB']),
      );
      expect(includes).not.toContain('additionalFields');
    });

    test('agendas: collapses to distinct top-level segments', () => {
      const includes = selectionToIncludes(
        new Set(['uid', 'network', 'network.uid', 'title']),
        AGENDA_SELECT,
      );
      expect(includes.sort()).toEqual(['network', 'title', 'uid']);
    });

    test('locations: renames the service fields, identity otherwise', () => {
      const includes = selectionToIncludes(
        new Set(['uid', 'verified', 'additionalFields', 'name']),
        LOCATION_SELECT,
      );
      expect(includes.sort()).toEqual(['name', 'state', 'tags', 'uid']);
    });

    test('locations: a dotted leaf collapses to its renamed top-level column', () => {
      const includes = selectionToIncludes(
        new Set(['uid', 'additionalFields.tags']),
        LOCATION_SELECT,
      );
      expect(includes.sort()).toEqual(['tags', 'uid']);
    });
  });

  describe('applyProjection (v3 boundary → native service option)', () => {
    // Each descriptor names the service's native restrictive projection option;
    // the boundary speaks one intent and the helper sets the right key.
    test('descriptors carry their native option name', () => {
      expect(EVENT_SELECT.option).toBe('includeFields');
      expect(AGENDA_SELECT.option).toBe('onlyIncludeFields');
      expect(LOCATION_SELECT.option).toBe('includeFields');
    });

    test('a null selection is a no-op (no option set)', () => {
      const options = { detailed: true };
      expect(applyProjection(options, null, AGENDA_SELECT)).toBe(options);
      expect(options).toEqual({ detailed: true });
    });

    test('agendas: sets onlyIncludeFields from the selection', () => {
      const options = {};
      applyProjection(options, new Set(['uid', 'title']), AGENDA_SELECT);
      expect(options.onlyIncludeFields.sort()).toEqual(['title', 'uid']);
      expect('includeFields' in options).toBe(false);
    });

    test('events: sets includeFields, honouring the bagKeys extra', () => {
      const options = {};
      applyProjection(
        options,
        new Set(['uid', 'additionalFields']),
        EVENT_SELECT,
        { bagKeys: ['fieldA'] },
      );
      expect(options.includeFields).toEqual(
        expect.arrayContaining(['uid', 'fieldA']),
      );
    });

    test('events: the bare bag without keys leaves the option unset', () => {
      // selectionToIncludes returns null → no pushdown, fall back to post-trim.
      const options = {};
      applyProjection(
        options,
        new Set(['uid', 'additionalFields']),
        EVENT_SELECT,
      );
      expect('includeFields' in options).toBe(false);
    });

    test('locations: sets includeFields with the store renames', () => {
      const options = {};
      applyProjection(
        options,
        new Set(['uid', 'verified', 'name']),
        LOCATION_SELECT,
      );
      expect(options.includeFields.sort()).toEqual(['name', 'state', 'uid']);
    });
  });

  describe('selectsTop', () => {
    test('null selection means everything → true', () => {
      expect(selectsTop(null, 'network')).toBe(true);
    });
    test('matches the top-level segment of a dotted path', () => {
      const selected = new Set(['uid', 'network.uid']);
      expect(selectsTop(selected, 'network')).toBe(true);
      expect(selectsTop(selected, 'locationSet')).toBe(false);
    });
  });

  describe('pickSelected', () => {
    const item = { uid: 1, title: { fr: 'x' }, location: null, extra: 'z' };

    test('null selection → item untouched', () => {
      expect(pickSelected(item, null)).toBe(item);
    });

    test('keeps only selected keys, preserving original order', () => {
      const selected = resolveFields(
        'location,title',
        openTree(['uid', 'title', 'location', 'extra']),
      );
      expect(pickSelected(item, selected)).toEqual({
        uid: 1,
        title: { fr: 'x' },
        location: null,
      });
      expect(Object.keys(pickSelected(item, selected))).toEqual([
        'uid',
        'title',
        'location',
      ]);
    });

    test('dotted paths trim nested objects', () => {
      const nested = {
        uid: 1,
        location: { uid: 9, name: 'X', city: 'Y', latitude: 1.2 },
      };
      const selected = resolveFields(
        'location.name,location.city',
        openTree(['uid', 'location']),
      );
      expect(pickSelected(nested, selected)).toEqual({
        uid: 1,
        location: { name: 'X', city: 'Y' },
      });
    });

    test('a dotted path maps over array elements', () => {
      const withArray = {
        uid: 1,
        timings: [
          { begin: 'a', end: 'b' },
          { begin: 'c', end: 'd' },
        ],
      };
      const selected = resolveFields(
        'timings.begin',
        openTree(['uid', 'timings']),
      );
      expect(pickSelected(withArray, selected)).toEqual({
        uid: 1,
        timings: [{ begin: 'a' }, { begin: 'c' }],
      });
    });

    test('a bare field wins over a deeper path (whole object kept)', () => {
      const nested = { uid: 1, location: { uid: 9, name: 'X' } };
      const selected = resolveFields(
        'location,location.name',
        openTree(['uid', 'location']),
      );
      expect(pickSelected(nested, selected)).toEqual({
        uid: 1,
        location: { uid: 9, name: 'X' },
      });
    });

    test('an unselected key named like a prototype member does not leak', () => {
      // A custom additional field really named `toString`/`constructor` must be
      // trimmed like any other unselected key — `key in tree` would have walked
      // the prototype chain and kept (and mangled) it.
      const withProtoKeys = {
        uid: 1,
        additionalFields: {
          foo: 'keep',
          toString: 'LEAK',
          constructor: { x: 9 },
        },
      };
      const selected = resolveFields(
        'additionalFields.foo',
        openTree(['uid', 'additionalFields']),
      );
      expect(pickSelected(withProtoKeys, selected)).toEqual({
        uid: 1,
        additionalFields: { foo: 'keep' },
      });
    });

    test('a selected additional field named like a prototype member is kept', () => {
      const withProtoKey = { uid: 1, additionalFields: { toString: 'v' } };
      const selected = resolveFields(
        'additionalFields.toString',
        openTree(['uid', 'additionalFields']),
      );
      expect(pickSelected(withProtoKey, selected)).toEqual({
        uid: 1,
        additionalFields: { toString: 'v' },
      });
    });
  });
});
