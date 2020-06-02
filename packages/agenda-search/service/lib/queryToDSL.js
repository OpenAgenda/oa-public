'use strict';

const validate = require('../../validators/query');

module.exports = (query, from = 0, size = 10) => {
  const mustPart = [];
  const filteredPart = [];

  const clean = validate(query);

  const dsl = {
    from,
    size,
    sort: _getSortDsl(clean),
    _source: { excludes: ['*_es'] },
    query: {
      bool: {}
    }
  };

  // when a text search is made, look into title and description
  if (clean.search !== null) {
    mustPart.push({
      multi_match: {
        query: clean.search,
        type: 'cross_fields',
        operator: 'and',
        fields: [
          'title', 'description', 'keywords'
        ]
      }
    });
  }

  if (clean.official !== null) {
    filteredPart.push({
      term: {
        official: clean.official
      }
    });
  }

  if (!mustPart.length && !filteredPart.length) {
    return Object.assign(dsl, {
      query: {
        match_all: {}
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


function _getSortDsl(query) {
  // a clean sort is set
  if (query.sort !== null) {
    return ({
      'createdAt.desc' : [{
        createdAt: {
          order: 'desc'
        }
      }]
    })[query.sort]
  }

  // default sort when a search is made
  if (query.search !== null) {
    return [{
      official: {
        order: 'desc'
      }
    }, {
      upcomingPublishedEvents: {
        order: 'desc',
      }
    }, {
      updatedAt: {
        order: 'desc'
      }
    }];
  }

  if (query.official) {
    return [{
      officializedAt: {
        order: 'desc'
      }
    }];
  }

  // the default sort
  return [{
    hasUpcomingPublished: {
      order: 'desc',
    }
  }, {
    updatedAt: {
      order: 'desc'
    }
  }];
}
