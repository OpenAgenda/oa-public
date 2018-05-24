"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const knex = require( 'knex' )( {
  client: 'mysql'
} );

const raw = [
  'reset.sql',
  'aggregator.create.sql',
  'aggregator_source.create.sql'
].map( fx => fs.readFileSync( __dirname + '/' + fx, 'utf-8' ).replace( /;$/, '' ) );


_append( raw, 'aggregator', [ {
  // network head ( NH )
  id: 1000,
  review_id: 1
}, {
  // network intermediate node 1 ( NIN 1 )
  id: 1100,
  review_id: 2
}, {
  // network intermediate node 2 ( NIN 2 )
  id: 1200,
  review_id: 3
}, {
  id: 2200,
  review_id: 4
} ] );

_append( raw, 'aggregator_source', [ {
  // NH < NIN 1
  id: 10000,
  aggregator_id: 1000,
  review_id: 2
}, {
  // NH < NIN 2
  id: 20000,
  aggregator_id: 1000,
  review_id: 3
}, {
  // NIN 1 < LEAF 1
  id: 11000,
  aggregator_id: 1100,
  review_id: 4
}, {
  // NIN 2 < LEAF 2
  id: 12000,
  aggregator_id: 1200,
  review_id: 5
}, {
  id: 22000,
  aggregator_id: 2200,
  review_id: 6
} ] );


module.exports.sql = raw.join( ';\n' ) + ';';

module.exports.getObject = async identifier => {

  // nothing is iinstantaneous
  await _nextTick();

  return _.isObject( identifier ) ? identifier : { id: identifier };

}

module.exports.getObjectItems = async ( object, lastId = 0, limit = 5 ) => {

  // nothing is iinstantaneous
  await _nextTick();

  // this is plugged to the agenda event service. The object is the agenda
  // the given list is the agenda-event refs

  const remaining = module.exports.references[ object.id ].filter( ref => lastId < parseFloat( ref.refId ) );

  const sliced = remaining.slice( 0, limit );

  return {
    items: sliced,
    lastId: _.get( _.last( sliced ), 'refId', null )
  }

}

function _append( raw, table, entries ) {

  raw.push( knex( table ).insert( entries ) );

}


function _nextTick() {

  return new Promise( rs => process.nextTick( () => rs() ) );

}

module.exports.references = {
  2: [ {
    refId: '2.01'
  }, {
    refId: '2.02'
  }, {
    refId: '2.03'
  }, {
    refId: '2.04'
  }, {
    refId: '2.05'
  }, {
    refId: '2.06'
  }, {
    refId: '2.07'
  }, {
    refId: '2.08'
  }, {
    refId: '2.09'
  }, {
    refId: '2.10'
  } ],
  3: [ {
    refId: '3.1'
  }, {
    refId: '3.2'
  }, {
    refId: '3.3'
  } ],
  4: [ {
    refId: '4.1'
  }, {
    refId: '4.2'
  }, {
    refId: '4.3'
  }, {
    refId: '4.4'
  }, {
    refId: '4.5'
  }, {
    refId: '4.6'
  }, {
    refId: '4.7'
  }, {
    refId: '4.8'
  } ],
  5: [ {
    refId: '5.1'
  }, {
    refId: '5.2'
  }, {
    refId: '5.3'
  }, {
    refId: '5.4'
  }, {
    refId: '5.5'
  }, {
    refId: '5.6'
  }, {
    refId: '5.7'
  }, {
    refId: '5.8'
  } ],
  6: [  {
    refId: '6.1'
  }, {
    refId: '6.2'
  }, {
    refId: '6.3'
  }, {
    refId: '6.4'
  }, {
    refId: '6.5'
  }, {
    refId: '6.6'
  }, {
    refId: '6.7'
  }, {
    refId: '6.8'
  }  ]
}