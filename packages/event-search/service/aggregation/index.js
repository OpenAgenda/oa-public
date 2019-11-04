"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

const log = require('@openagenda/logs')('aggregation');

const termsTemplate = _.template( fs.readFileSync( __dirname + '/terms.tpl', 'utf-8' ) );

const types = {
  terms: {
    validate: require( './terms.validator' ),
    template: termsTemplate
  },
  timings: {
    parse: require( './timings.parse' ),
    validate: require( './timings.validator' ),
    template: _.template( fs.readFileSync( __dirname + '/timings.tpl', 'utf-8' ) )
  },
  timingsReverseHits: {
    parse: require( './timingsReverseHits.parse' ),
    validate: require( './timingsReverseHits.validator' ),
    template: _.template(fs.readFileSync( __dirname + '/timingsReverseHits.tpl', 'utf-8' ))
  },
  timespan: {
    parse: require( './timespan.parse' ),
    template: _.template( fs.readFileSync( __dirname + '/timespan.tpl', 'utf-8' ) )
  },
  objectsAsTerms: {
    validate: require( './terms.validator' ),
    template: termsTemplate,
    parse: require( './objectsAsTerms.parse' )
  }
}

module.exports = Object.assign(buildDsl, { parseResult });

function buildDsl(config, aggregators = [], predefined = {}, query = {}) {
  log('bulding aggregation DSL');

  const dsl = {};

  [].concat(aggregators).map(_cleanAggregatorConfiguration.bind( null, config, predefined, query ))

    .forEach(({ type, field, destination, data }) => {

      // simple template
      dsl[destination] = JSON.parse(types[type].template(data));

    });

  return dsl;
}

function parseResult(config, aggregators, result, predefined = {}, parseEvents = null) {
  log('parsing aggregation result for %s defined aggregators', [].concat(aggregators).length);

  const parsed = {};

  [].concat(aggregators).map(_cleanAggregatorConfiguration.bind(null, config, predefined, {})).forEach(({ type, field, destination, data }) => {

    const parse = types[type].parse || _defaultParse.bind(null, destination);

    parsed[ destination ] =  parse( result[ destination ], { config } );

    if ( !parsed[ destination ].length || !parsed[ destination ][ 0 ].sampleEvents || !parseEvents ) return;

    parsed[ destination ].forEach( b => {

      b.sampleEvents = parseEvents( b.sampleEvents );

    } );

  } );

  return parsed;

}

function _defaultParse( fieldName, result ) {

   return result.buckets.map( b => ( { key: b.key, count: b.doc_count } ) );

}


function _cleanAggregatorConfiguration(config, predefined = {}, query = {}, a) {

  let aObj, type, field, destination, data;

  if (typeof a !== 'string') {

    aObj = a;

  } else if ( predefined[ a ] !== undefined ) {

    aObj = predefined[ a ];

  } else {

    aObj = {
      type: 'terms',
      field: a,
      destination: a,
      data: {
        type: a,
        field: a
      }
    }

  }

  type = aObj.type || 'terms';

  field = aObj.field || aObj.type;

  destination = aObj.destination || aObj.field || aObj.type;

  data = _.extend( {}, aObj, { type, field, query } );

  return {
    type,
    field,
    destination,
    data: types[ type ].validate ? types[ type ].validate( data, { config } ) : data,
    query
  };

}
