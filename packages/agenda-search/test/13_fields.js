'use strict';

const assert = require('assert');

const {
  defineIncludes
} = require('../service/lib/fields');

describe('13 - fields', () => {

  describe('defineIncludes', () => {

    it('by default, non detailed fields are included', () => {
      assert.deepEqual(
        defineIncludes({ detailed: false }),
        ['image', 'uid', 'description', 'official', 'title', 'slug']
      );
    });

    it('includeFields amends base fields', () => {
      assert.deepEqual(
        defineIncludes({ includeFields: 'createdAt' }),
        ['image', 'uid', 'description', 'official', 'title', 'slug', 'createdAt']
      );
    });

    it('if detailed option is true, detailed fields are included', () => {
      assert.deepEqual(
        defineIncludes({ detailed: true }),
        [
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
          'settings'
        ]
      );
    });

    it('if fields array is provided, only requested fields are included', () => {
      assert.deepEqual(
        defineIncludes({ onlyIncludeFields: ['uid', 'summary'] }),
        ['uid', 'summary.keywords', 'summary.recentlyAddedEvents', 'summary.publishedEvents']
      );
    });

  });


});