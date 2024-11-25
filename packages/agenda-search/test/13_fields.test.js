import { defineIncludes } from '../service/lib/fields.js';

describe('13 - fields', () => {
  describe('defineIncludes', () => {
    it('by default, non detailed fields are included', () => {
      expect(defineIncludes({ detailed: false })).toEqual([
        'image',
        'uid',
        'description',
        'official',
        'title',
        'slug',
      ]);
    });

    it('includeFields amends base fields', () => {
      expect(defineIncludes({ includeFields: 'createdAt' })).toEqual([
        'image',
        'uid',
        'description',
        'official',
        'title',
        'slug',
        'createdAt',
      ]);
    });

    it('if detailed option is true, detailed fields are included', () => {
      expect(defineIncludes({ detailed: true })).toEqual([
        'image',
        'uid',
        'description',
        'official',
        'title',
        'slug',
        'summary.keywords',
        'summary.recentlyAddedEvents',
        'summary.publishedEvents',
        'schema',
        'createdAt',
        'network',
        'locationSet',
        'settings',
      ]);
    });

    it('if fields array is provided, only requested fields are included', () => {
      expect(defineIncludes({ onlyIncludeFields: ['uid', 'summary'] })).toEqual(
        [
          'uid',
          'summary.keywords',
          'summary.recentlyAddedEvents',
          'summary.publishedEvents',
        ],
      );
    });
  });
});
