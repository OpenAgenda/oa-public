"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );

let config;
let knex;
let service;

module.exports = Object.assign( remove, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

}

function remove( identifiers, cb ) {

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      return knex( config.schemas.feed ).delete().where( { id: feed.id } );

    } );

  return promisePlusCb( promise, cb );

};
