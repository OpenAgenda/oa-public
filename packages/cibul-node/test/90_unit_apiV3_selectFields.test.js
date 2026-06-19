import {
  fieldNamesOf,
  resolveFields,
  pickSelected,
  eventFieldsToIncludes,
  agendaFieldsToOnlyIncludes,
  locationFieldsToIncludes,
} from '../api-v3/lib/selectFields.js';
import mapEvent, { mapEventSummary } from '../api-v3/lib/mapEvent.js';
import { mapAgendaDetailed } from '../api-v3/lib/mapAgenda.js';

// Unit coverage for the v3 `?fields=` sparse selector. The gate
// (`resolveFields`), the trimmer (`pickSelected`), the drift-proof view
// introspection (`fieldNamesOf`) and the ES pushdown translation
// (`eventFieldsToIncludes`) are pure — no container needed.

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
  });

  describe('eventFieldsToIncludes (ES pushdown translation)', () => {
    test('mostly identity — contract names match the _source names', () => {
      const includes = eventFieldsToIncludes(
        new Set(['uid', 'title', 'location']),
      );
      expect(includes.sort()).toEqual(['location', 'title', 'uid']);
    });

    test('a derived timing field also pulls the full timings array', () => {
      const includes = eventFieldsToIncludes(new Set(['uid', 'nextTiming']));
      expect(includes).toContain('nextTiming');
      expect(includes).toContain('timings');
    });

    test('the whole additionalFields bag bails out of pushdown (null)', () => {
      expect(
        eventFieldsToIncludes(new Set(['uid', 'additionalFields'])),
      ).toBeNull();
    });

    test('a dotted path passes through; a custom field flattens', () => {
      const includes = eventFieldsToIncludes(
        new Set(['uid', 'location.name', 'additionalFields.myField']),
      );
      expect(includes).toContain('location.name');
      expect(includes).toContain('myField');
      expect(includes).not.toContain('additionalFields.myField');
    });
  });

  describe('agendaFieldsToOnlyIncludes', () => {
    test('collapses to distinct top-level segments (whole subtree)', () => {
      const includes = agendaFieldsToOnlyIncludes(
        new Set(['uid', 'network', 'network.uid', 'title']),
      );
      expect(includes.sort()).toEqual(['network', 'title', 'uid']);
    });
  });

  describe('locationFieldsToIncludes', () => {
    test('maps the renamed service fields, identity otherwise', () => {
      const includes = locationFieldsToIncludes(
        new Set(['uid', 'verified', 'additionalFields', 'name']),
      );
      expect(includes.sort()).toEqual(['name', 'state', 'tags', 'uid']);
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
