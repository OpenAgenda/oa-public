'use strict';

const { defineIncludes } = require('./fields');
const cleanAfter = require('./cleanAfter');
const log = require('@openagenda/logs')('queryToDSL');

module.exports = (query, nav, options = {}) => {
  const mustPart = [];
  const filteredPart = [];

  const includes = defineIncludes(options);

  const dsl = {
    size: nav.size,
    _source: {
      excludes: ['_*'],
      includes
    },
    query: {
      bool: {
        should: [{
          term: {
            official: {
              value: true,
              boost : 20
            }
          }
        }, {
          range: {
            updatedAt: {
              boost: 10,
              gte: (new Date).getTime() - 7*24*60*60*1000 // 1 week ago
            }
          }
        }, {
          term: {
            _hasUpcomingPublished: {
              value: true,
              boost: 1
            }
          }
        }]
      }
    }
  };
  
  if (nav.after) {
    const after = cleanAfter(query, nav)
    dsl.search_after = after;
  } else {
    dsl.from = nav.from;
  }

  if (query?.contributionType) {
    filteredPart.push({
      terms: {
        'settings.contribution.type' : query.contributionType
      }
    });
  }

  if (query?.updatedAt.lte || query?.updatedAt.gte) {
    filteredPart.push(_timestampFilter('updatedAt', query.updatedAt));
  }

  if (options.indexed !== null) {
    filteredPart.push({
      term: {
        indexed: options.indexed
      }
    });
  }

  if (query?.uid) {
    filteredPart.push({
      terms: {
        uid: query.uid
      }
    });
  }

  if (query?.slug) {
    filteredPart.push({
      terms: {
        slug: query.slug
      }
    });
  }

  if (nav.sort) {
    dsl.sort = ({
      'createdAt.desc' : [{
        createdAt: {
          order: 'desc'
        }
      }],
      'recentlyAddedEvents.desc' : [{
        _recentlyAddedEvents: {
          order: 'desc'
        }
      }]
    })[nav.sort];
  } else if (!query?.search) {
    dsl.sort = [{
      _recentlyAddedEvents: {
        order: 'desc'
      }
    }];
  } else {
    dsl.sort = [
      '_score'
    ];
  }

  dsl.sort.push({
    uid: { order: 'asc' }
  });

  // when a text search is made, look into title and description
  if (query && query.search !== null) {
    mustPart.push({
      multi_match: {
        query: query.search,
        type: 'best_fields',
        fields: [
          'title^4', 'description^2', 'summary.keywords^1'
        ],
        "tie_breaker": 0.1
      }
    });
  } else {
    dsl.query.bool.should.push({
      match_all: {}
    });
  }

  if (query && query.official !== null) {
    filteredPart.push({
      term: {
        official: query.official
      }
    });
  }

  if (query && query.network !== null) {
    filteredPart.push({
      term: {
        'network.uid': query.network
      }
    })
  }

  if (query && query.locationSet !== null) {
    filteredPart.push({
      term: {
        'locationSet.uid': query.locationSet
      }
    });
  }

  if (mustPart.length) {
    dsl.query.bool.must = mustPart;
  }

  if (filteredPart.length) {
    dsl.query.bool.filter = filteredPart;
  }

  return dsl;
}

function _timestampFilter(field, { gte, lte }) {
  const range = {};

  if (gte) {
    range.gte = gte;
  }
  if (lte) {
    range.lte = lte;
  }

  return {
    range: {
      [field]: range
    }
  };
}
