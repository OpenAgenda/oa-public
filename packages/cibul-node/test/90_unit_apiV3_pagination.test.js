import buildPagination from '../api-v3/lib/pagination.js';
import { decodeCursor } from '../api-v3/lib/cursor.js';

describe('90 - api-v3 unit - buildPagination', () => {
  describe('total / totalRelation', () => {
    it('omits both total and totalRelation when total is undefined', () => {
      const p = buildPagination({ limit: 20 });
      expect(p).not.toHaveProperty('total');
      expect(p).not.toHaveProperty('totalRelation');
    });

    it('defaults totalRelation to "exact" when only total is given', () => {
      const p = buildPagination({ limit: 20, total: 342 });
      expect(p.total).toBe(342);
      expect(p.totalRelation).toBe('exact');
    });

    it('passes through an explicit "atLeast" relation (the ES floor case)', () => {
      const p = buildPagination({
        limit: 20,
        total: 10000,
        totalRelation: 'atLeast',
      });
      expect(p.total).toBe(10000);
      expect(p.totalRelation).toBe('atLeast');
    });

    it('keeps totalRelation when total is 0 (not undefined)', () => {
      const p = buildPagination({ limit: 20, total: 0 });
      expect(p.total).toBe(0);
      expect(p.totalRelation).toBe('exact');
    });
  });

  describe('after cursor', () => {
    it('encodes the after position and pins the sort', () => {
      const p = buildPagination({
        limit: 1,
        after: [1700000000000, 42],
        sort: 'createdAt.desc',
      });
      expect(decodeCursor(p.after)).toEqual({
        after: [1700000000000, 42],
        sort: 'createdAt.desc',
      });
    });

    it('returns a null cursor on the last page', () => {
      const p = buildPagination({
        limit: 20,
        after: [1700000000000, 42],
        isLastPage: true,
      });
      expect(p.after).toBeNull();
    });
  });
});
