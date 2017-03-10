"use strict";

let config;
let knex;

module.exports = Object.assign( create, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

}

function create( entityType, entityUid ) {
};
