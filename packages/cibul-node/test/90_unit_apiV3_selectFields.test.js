import {
  fieldNamesOf,
  resolveFields,
  pickSelected,
  selectionToIncludes,
  selectsTop,
} from '../api-v3/lib/selectFields.js';
import mapEvent, {
  mapEventSummary,
  EVENT_SELECT,
  CLEANERS,
} from '../api-v3/lib/mapEvent.js';
import { mapAgendaDetailed, AGENDA_SELECT } from '../api-v3/lib/mapAgenda.js';
import mapLocation, { LOCATION_SELECT } from '../api-v3/lib/mapLocation.js';

// Unit coverage for the v3 `?fields=` sparse selector. The gate
// (`resolveFields`, incl. strict nested leaves), the trimmer (`pickSelected`),
// the drift-proof view introspection (`fieldNamesOf`) and the generic store
// pushdown translation (`selectionToIncludes`) are pure — no container needed.

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

describe('api-v3 selectFields', () => {
  describe('fieldNamesOf', () => {
    test('mirrors the mapper key set (no separate allowlist to drift)', () => {
      const names = fieldNamesOf(mapEventSummary);
      // Probing the empty-tolerant mapper yields its full emitted key set.
      expect(names).toEqual(Object.keys(mapEventSummary({})));
      expect(names).toContain('uid');
      expect(names).toContain('additionalFields');
    });

    test('the full mapper exposes the detailed-only fields too', () => {
      // The route passes the RICHEST mapper as the universe, so detailed-only
      // fields are selectable without `detailed=true`.
      expect(fieldNamesOf(mapEvent)).toContain('longDescription');
    });

    test('appends route-grafted names (e.g. /me role/private)', () => {
      const names = fieldNamesOf(mapAgendaDetailed, ['private', 'role']);
      expect(names).toContain('role');
      expect(names).toContain('private');
      expect(names).toContain('createdAt');
    });
  });

  describe('SELECT descriptors stay in lockstep with their mappers', () => {
    // The selection metadata is an overlay on the mapper-derived universe: every
    // field it declares children/renames for MUST be a real emitted field, or it
    // silently does nothing. These guards fail fast on a rename/typo drift.
    const universeOf = (map, extra) => new Set(fieldNamesOf(map, extra));

    test('event children + bag are real Event fields', () => {
      const universe = universeOf(mapEvent);
      for (const field of Object.keys(EVENT_SELECT.children)) {
        expect(universe.has(field)).toBe(true);
      }
      for (const field of Object.keys(EVENT_SELECT.derives)) {
        expect(universe.has(field)).toBe(true);
      }
      expect(universe.has(EVENT_SELECT.bag)).toBe(true);
    });

    test('agenda children are real AgendaDetailed fields', () => {
      const universe = universeOf(mapAgendaDetailed);
      for (const field of Object.keys(AGENDA_SELECT.children)) {
        expect(universe.has(field)).toBe(true);
      }
    });

    test('location children + renamed fields are real Location fields', () => {
      const universe = universeOf(mapLocation);
      for (const field of Object.keys(LOCATION_SELECT.children)) {
        expect(universe.has(field)).toBe(true);
      }
      for (const field of Object.keys(LOCATION_SELECT.store)) {
        expect(universe.has(field)).toBe(true);
      }
    });

    test('event children cover EXACTLY the mapper-allowlisted (CLEANERS) fields', () => {
      // The converse of the membership checks above: a CLEANERS-backed field
      // that lacks a children entry would silently lose strict-leaf validation,
      // and a children entry with no cleaner would validate against a keyset the
      // mapper never enforces. Both are drift; pin them equal.
      expect(Object.keys(EVENT_SELECT.children).sort()).toEqual(
        Object.keys(CLEANERS).sort(),
      );
    });

    test('declared children keysets match the keys the mappers actually emit', () => {
      // Probe each mapper with an over-populated nested value and assert the
      // emitted sub-keys equal the declared keyset — catches a hand-written
      // children literal drifting from refOrNull / the extIds / CLEANERS shape.
      const fill = (keys) =>
        Object.fromEntries([...keys, '__extra__'].map((k) => [k, 1]));

      const eventLocation = mapEvent({
        location: fill(EVENT_SELECT.children.location),
      }).location;
      expect(Object.keys(eventLocation).sort()).toEqual(
        [...EVENT_SELECT.children.location].sort(),
      );

      const agendaNetwork = mapAgendaDetailed({
        network: { uid: 1, title: 't', __extra__: 9 },
      }).network;
      expect(Object.keys(agendaNetwork).sort()).toEqual(
        [...AGENDA_SELECT.children.network].sort(),
      );

      const locationExtId = mapLocation({
        extIds: [{ key: 'k', value: 'v', __extra__: 9 }],
      }).extIds[0];
      expect(Object.keys(locationExtId).sort()).toEqual(
        [...LOCATION_SELECT.children.extIds].sort(),
      );
    });
  });

  describe('resolveFields', () => {
    // The universe is the resource's FULL field set (richest mapper), not a
    // `detailed`-gated tier.
    const allowed = fieldNamesOf(mapEvent);

    test('absent → null (no trimming)', () => {
      expect(resolveFields(undefined, allowed)).toBeNull();
    });

    test('CSV list → Set of names, uid always retained', () => {
      const selected = resolveFields('title,location', allowed);
      expect([...selected].sort()).toEqual(['location', 'title', 'uid']);
    });

    test('a detailed-only field is selectable over the full universe', () => {
      const selected = resolveFields('longDescription', allowed);
      expect([...selected].sort()).toEqual(['longDescription', 'uid']);
    });

    test('dotted paths are accepted (top-level segment validated)', () => {
      const selected = resolveFields('location.name,location.city', allowed);
      expect([...selected].sort()).toEqual([
        'location.city',
        'location.name',
        'uid',
      ]);
    });

    test('a dotted path under an UNKNOWN top-level segment → 400', () => {
      const err = expect400(() => resolveFields('nope.deep', allowed));
      expect(err.info.errors[0].message).toContain('nope.deep');
    });

    test('repeated param (qs array) is accepted too', () => {
      const selected = resolveFields(['title', 'location'], allowed);
      expect(selected.has('title')).toBe(true);
      expect(selected.has('location')).toBe(true);
      expect(selected.has('uid')).toBe(true);
    });

    test('whitespace and empty tokens are tolerated', () => {
      const selected = resolveFields(' title , , location ', allowed);
      expect([...selected].sort()).toEqual(['location', 'title', 'uid']);
    });

    test('unknown field (not in the universe) → 400 naming the offender', () => {
      const err = expect400(() => resolveFields('title,nope', allowed));
      expect(err.info.errors[0].message).toContain('nope');
    });

    test('empty value → 400', () => {
      expect(expect400(() => resolveFields('', allowed)).name).toBe(
        'BadRequest',
      );
      expect(expect400(() => resolveFields('  ,  ', allowed)).name).toBe(
        'BadRequest',
      );
    });

    test('bracketed/object form → 400', () => {
      const err = expect400(() => resolveFields({ gte: 'title' }, allowed));
      expect(err.info.errors[0].message).toContain('comma-separated');
    });

    describe('strict nested leaves (children keysets)', () => {
      const { children } = EVENT_SELECT;

      test('a known nested leaf is accepted', () => {
        const selected = resolveFields('location.name', allowed, children);
        expect(selected.has('location.name')).toBe(true);
      });

      test('an unknown nested leaf under a declared keyset → 400', () => {
        const err = expect400(() =>
          resolveFields('location.zzz', allowed, children));
        expect(err.info.errors[0].message).toContain('location.zzz');
      });

      test('a leaf under an OPEN field (the bag) stays best-effort', () => {
        const selected = resolveFields(
          'additionalFields.myCustom',
          allowed,
          children,
        );
        expect(selected.has('additionalFields.myCustom')).toBe(true);
      });

      test('a leaf under a field with no declared keyset stays best-effort', () => {
        // `age` is a pass-through object (no CLEANERS allowlist) → not validated.
        const selected = resolveFields('age.min', allowed, children);
        expect(selected.has('age.min')).toBe(true);
      });

      test('only the FIRST nested segment is validated (deeper is best-effort)', () => {
        const selected = resolveFields('image.variants.zzz', allowed, children);
        expect(selected.has('image.variants.zzz')).toBe(true);
      });
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
      // An agenda with zero custom fields yields bagKeys=[]; the bag must still
      // bail (full fetch keeps any orphan _source keys) rather than push an
      // override that erases the bag.
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
        {
          ...EVENT_SELECT,
          bagKeys: ['fieldA', 'fieldB'],
        },
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
      const selected = resolveFields('location,title', [
        'uid',
        'title',
        'location',
        'extra',
      ]);
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
      const selected = resolveFields('location.name,location.city', [
        'uid',
        'location',
      ]);
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
      const selected = resolveFields('timings.begin', ['uid', 'timings']);
      expect(pickSelected(withArray, selected)).toEqual({
        uid: 1,
        timings: [{ begin: 'a' }, { begin: 'c' }],
      });
    });

    test('a bare field wins over a deeper path (whole object kept)', () => {
      const nested = { uid: 1, location: { uid: 9, name: 'X' } };
      const selected = resolveFields('location,location.name', [
        'uid',
        'location',
      ]);
      expect(pickSelected(nested, selected)).toEqual({
        uid: 1,
        location: { uid: 9, name: 'X' },
      });
    });
  });
});
