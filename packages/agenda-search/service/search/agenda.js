"use strict";

var utils = require( 'utils' );

module.exports = {

  // index name
  alias: 'agenda',

  type: 'agenda',

  // used at index creation
  indexBody: getIndexSettings(),

  // prepare dsl query
  query: query,

  // clean items before being put to index
  clean: clean,

  // process items read from index
  parse: parse,

  mappings: getMappings()

}


function query( q, offset, limit ) {

  var dsl = {
    from: offset,
    size: limit,
    sort: {
      updatedAt: {
        order: 'desc'
      }
    },
    _source: { exclude: ['*_es'] }
  },

  query = {};

  if ( q.search && q.search.length ) {

    query.multi_match = {
      query: q.search,
      type: 'cross_fields',
      operator: 'and',
      fields: [
        'title', 'description'
      ]
    }

  }

  if ( !utils.size( query ) ) {

    query = { match_all: {} };

  }

  dsl.query = query;

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

  [ 'id', 'uid', 'slug', 'title', 'description', 'updated_at', 'image' ].forEach( k => {

    c[ utils.toCamelCase( k ) ] = a[ k ];

  } );

  c.image = a.image ? config.image.path + a.image : config.image.default;
  
  return c;

}