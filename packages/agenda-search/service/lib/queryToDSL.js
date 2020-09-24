'use strict';

const validate = require('../../validators/query');

module.exports = (query, from = 0, size = 10) => {
  const mustPart = [];
  const filteredPart = [];

  const clean = validate(query);

  const dsl = {
    from,
    size,
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

  if (clean.sort) {
    dsl.sort = ({
      'createdAt.desc' : [{
        createdAt: {
          order: 'desc'
        }
      }]
    })[clean.sort];
  }

  // when a text search is made, look into title and description
  if (clean.search !== null) {
    mustPart.push({
      multi_match: {
        query: clean.search,
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

  if (clean.official !== null) {
    filteredPart.push({
      term: {
        official: clean.official
      }
    });
  }

  if (clean.network !== null) {
    filteredPart.push({
      term: {
        'network.uid': clean.network
      }
    })
  }

  if (mustPart.length) {
    dsl.query.bool.must = mustPart;
  }

  if (filteredPart.length) {
    dsl.query.bool.filter = filteredPart;
  }

  return dsl;
}
