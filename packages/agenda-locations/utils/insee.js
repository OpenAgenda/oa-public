"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const redis = require( 'redis' );
const sa = require( 'superagent' );
const slug = require( 'slug' );

const ns = 'insee';

const res = ( { latitude, longitude } ) => `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}`;

const cache = {};

let client;

module.exports = _.extend( insee, { init } );

function init( c ) {

  client = redis.createClient( c.redis.port, c.redis.host );

  cache.get = promisify( client.hget.bind( client, ns ) );

  cache.set = promisify( client.hset.bind( client, ns ) );

}

function _key( { city, department } ) {

  return [ slug( department, { lower: true } ), slug( city, { lower: true } ) ].join('|');

}

async function insee( { city, department, latitude, longitude } ) {

  insee.fromCache = false;

  const cached = await cache.get( _key( { city, department } ) );

  if ( cached ) {

    insee.fromCache = true;

    return _parse( JSON.parse( cached ) );

  }

  const { body } = await sa.get( res( { latitude, longitude } ) );

  await cache.set( _key( { city, department } ), JSON.stringify( body ) );

  return _parse( body );

}

function _parse( body ) {

  return _.get( _.first( body ), 'code' );

}