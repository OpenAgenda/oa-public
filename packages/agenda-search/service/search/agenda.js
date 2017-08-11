"use strict";

const utils = require( 'utils' ),

  _ = require( 'lodash' ),

  validate = require( '../../validators/query' ),

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

  let clean = {}, mustPart = [], filteredPart = [];

  try {

    clean = validate( q );

  } catch( e ) {}

  let dsl = {
    from: offset,
    size: limit,
    sort: getSortDsl( clean ),
    _source: { exclude: ['*_es'] },
    query: {
      bool: {}
    }
  };

  // when a text search is made, look into title and description
  if ( clean.search !== null ) {

    mustPart.push( {
      multi_match: {
        query: q.search,
        type: 'cross_fields',
        operator: 'and',
        fields: [
          'title', 'description', 'keywords'
        ]
      }
    } );

  }

  if ( clean.official !== null ) {

    filteredPart.push( {
      term: {
        official: clean.official
      }
    } );

  }

  if ( !mustPart.length && !filteredPart.length ) {

    return _.extend( dsl, {
      query: {
        match_all: {}
      }
    } );

  }

  if ( mustPart.length ) {

    dsl.query.bool.must = mustPart;

  }

  if ( filteredPart.length ) {

    dsl.query.bool.filter = filteredPart;

  }

  return dsl;

}


function getSortDsl( query ) {

  // a clean sort is set
  if ( query.sort !== null ) {

    return ( {
      'createdAt.desc' : [ {
        createdAt: {
          order: 'desc'
        }
      } ]
    } )[ query.sort ]

  }


  // default sort when a search is made
  if ( query.search !== null ) {

    return [ {
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

  if ( query.official ) {

    return [ {
      officializedAt: {
        order: 'desc'
      }
    } ]

  }


  // the default sort
  return [ {
    hasUpcomingPublished: {
      order: 'desc',
    }
  }, {
    updatedAt: {
      order: 'desc'
    }
  } ];

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
          type: 'keyword'
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

        createdAt: {
          type: 'date'
        },

        official: {
          type: 'boolean'
        },

        officializedAt: {
          type: 'date'
        },

        keywords: {
          type: 'keyword'
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

  [ 
    'id',
    'uid',
    'slug',
    'title',
    'description',
    'official',
    'image', 
    'publishedEvents',
    'upcomingPublishedEvents',
    'keywords',
    'officializedAt',
    'updatedAt',
    'createdAt' 
  ].forEach( k => {

    c[ utils.toCamelCase( k ) ] = a[ k ];

  } );

  c.image = a.image ? config.image.path + a.image : config.image.default;

  c.hasUpcomingPublished = !!c.upcomingPublishedEvents;
  
  return c;

}