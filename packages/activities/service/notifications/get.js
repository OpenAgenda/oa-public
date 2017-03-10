"use strict";

let config;
let knex;

module.exports = Object.assign( get, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

}

function get( entityType, entityUid ) {
};
