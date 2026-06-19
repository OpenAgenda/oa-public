import {
  fieldNamesOf,
  resolveFields,
  pickSelected,
} from '../api-v3/lib/selectFields.js';
import { mapEventSummary } from '../api-v3/lib/mapEvent.js';
import { mapAgendaDetailed } from '../api-v3/lib/mapAgenda.js';

// Unit coverage for the v3 `?fields=` sparse selector. The route gate
// (`resolveFields`), the trimmer (`pickSelected`) and the drift-proof view
// introspection (`fieldNamesOf`) are pure — no container needed.

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
      expect(names).toContain('timezone');
      expect(names).toContain('additionalFields');
      // Detailed-only fields are NOT selectable on the summary view.
      expect(names).not.toContain('longDescription');
    });

    test('appends route-grafted names (e.g. /me role/private)', () => {
      const names = fieldNamesOf(mapAgendaDetailed, ['private', 'role']);
      expect(names).toContain('role');
      expect(names).toContain('private');
      expect(names).toContain('createdAt');
    });
  });

  describe('resolveFields', () => {
    const allowed = fieldNamesOf(mapEventSummary);

    test('absent → null (no trimming)', () => {
      expect(resolveFields(undefined, allowed)).toBeNull();
    });

    test('CSV list → Set of names, uid always retained', () => {
      const selected = resolveFields('title,location', allowed);
      expect([...selected].sort()).toEqual(['location', 'title', 'uid']);
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

    test('unknown field → 400 naming the offender', () => {
      const err = expect400(() => resolveFields('title,nope', allowed));
      expect(err.info.errors[0].message).toContain('nope');
    });

    test('out-of-view (detailed-only on summary) field → 400', () => {
      const err = expect400(() => resolveFields('longDescription', allowed));
      expect(err.info.errors[0].message).toContain('longDescription');
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
  });
});
