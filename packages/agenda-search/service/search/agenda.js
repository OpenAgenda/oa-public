"use strict";

const utils = require( 'utils' ),

obj = {

  // index name
  alias: 'agenda',

  type: 'agenda',

  // used at index creation
  indexBody: getIndexSettings(),

  // prepare dsl query
  query,

  // clean items before being put to index
  clean,

  // process items read from index
  parse,

  mappings: getMappings()

}



module.exports = obj;

module.exports.init = function( cfg ) {

  if ( cfg && cfg.alias ) obj.alias = cfg.alias;

}

/**
 * build dsl query for fetching agendas
 */
function query( q, offset, limit ) {

  let clean = _cleanQuery( q ),

  isFiltered = _isFilteredQuery( clean ),

  dsl = {
    from: offset,
    size: limit,
    sort: [ {
      hasUpcomingPublished: {
        order: 'desc',
      }
    }, {
      updatedAt: {
        order: 'desc'
      }
    } ],
    _source: { exclude: ['*_es'] }
  },

  dslQuery = {};

  // when a text search is made, look into title and description
  if ( clean.search !== null ) {

    dslQuery.multi_match = {
      query: q.search,
      type: 'cross_fields',
      operator: 'and',
      fields: [
        'title', 'description'
      ]
    }

    dsl.sort = [ {
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
    } ];

  }


  // when a text search is made, make sure 
  if ( !utils.size( dslQuery ) ) {

    dslQuery = { match_all: {} };

  }

  dsl.query = dslQuery;

  if ( !isFiltered ) {

    return dsl;

  }

  
  dsl.filter = {};

  if ( clean.official !== null ) {

    dsl.filter.bool = {
      must: {
        term: {
          official: clean.official
        }
      }
    }

  }

  return dsl;

}


function getMappings() {

  return {
    agenda: {

      properties: {

        id: {
          type: 'integer',
          index: 'not_analyzed'
        },

        uid: {
          type: 'integer',
          index: 'not_analyzed'
        },

        publishedEvents: {
          type: 'integer',
          index: 'not_analyzed'
        },

        upcomingPublishedEvents: {
          type: 'integer',
          index: 'not_analyzed'
        },

        hasUpcomingPublished: {
          type: 'boolean',
          index: 'not_analyzed'
        },

        slug: {
          type: 'string',
          index: 'not_analyzed'
        },

        title: {
          type: 'string',
          analyzer: 'custom'
        },

        description: {
          type: 'string',
          analyzer: 'custom'
        },

        image: {
          type: 'string',
          index: 'not_analyzed'
        },

        updatedAt: {
          type: 'date'
        },

        official: {
          type: 'boolean'
        }

      }

    }
  }

}


function getIndexSettings() {

  return {
    analysis: {
      analyzer: {
        custom: {
          type: 'custom',
          tokenizer: 'standard',
          filter : [ 'standard', 'lowercase', 'asciifolding', 'my_word_delimiter' ]
        }
      },
      filter : {
        my_word_delimiter : {
          type : 'word_delimiter',
          preserve_original: "true"
        }
      }
    }
  }

}


function parse( hit ) {

  return hit._source;

}


function clean( a, config ) {

  var c = {};

  [ 'id', 'uid', 'slug', 'title', 'description', 'updated_at', 'image', 'publishedEvents', 'upcomingPublishedEvents', 'official' ].forEach( k => {

    c[ utils.toCamelCase( k ) ] = a[ k ];

  } );

  c.image = a.image ? config.image.path + a.image : config.image.default;

  c.hasUpcomingPublished = !!c.upcomingPublishedEvents;
  
  return c;

}


function _cleanQuery( q ) {

  if ( !q ) return {};

  let clean = Object.assign( {
    search: null,
    official: null
  }, q );

  if ( clean.official !== null ) {

    clean.official = !!clean.official;

  }

  if ( clean.search !== null && typeof clean.search !== 'string' ) {

    clean.search = null;

  }

  return clean;

}


function _isFilteredQuery( q ) {

  let filteringKeys = [ 'official' ],

  setKeys = Object.keys( q ).filter( k => q[ k ] !== null );

  return !!filteringKeys.filter( filteringKey => setKeys.indexOf( filteringKey ) !== -1 ).length;

}