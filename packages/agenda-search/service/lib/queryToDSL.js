'use strict';

module.exports = (query, nav) => {
  const mustPart = [];
  const filteredPart = [];

  const dsl = {
    size: nav.size,
    _source: { excludes: ['*_es'] },
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
            hasUpcomingPublished: {
              value: true,
              boost: 1
            }
          }
        }]
      }
    }
  };
  
  if (nav.after) {
    dsl.search_after = nav.after;
  } else {
    dsl.from = nav.from;
  }

  if (query.contributionType) {
    filteredPart.push({
      terms: {
        'settings.contribution.type' : query.contributionType
      }
    });
  }

  if (query.updatedAt.lte || query.updatedAt.gte) {
    filteredPart.push(_timestampFilter('updatedAt', query.updatedAt));
  }

  if (query.uid) {
    filteredPart.push({
      terms: {
        uid: query.uid
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
      'recentlyContributed.desc' : [{
        recentlyContributedEvents: {
          order: 'desc'
        }
      }]
    })[nav.sort];
  } else {
    dsl.sort = [
      '_score'
    ];
  }

  dsl.sort.push({
    uid: { order: 'asc' }
  });

  // when a text search is made, look into title and description
  if (query.search !== null) {
    mustPart.push({
      multi_match: {
        query: query.search,
        type: 'best_fields',
        fields: [
          'title^4', 'description^2', 'keywords^1'
        ],
        "tie_breaker": 0.1
      }
    });
  } else {
    dsl.query.bool.should.push({
      match_all: {}
    });
  }

  if (query.official !== null) {
    filteredPart.push({
      term: {
        official: query.official
      }
    });
  }

  if (query.network !== null) {
    filteredPart.push({
      term: {
        'network.uid': query.network
      }
    })
  }

  if (query.locationSet !== null) {
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
