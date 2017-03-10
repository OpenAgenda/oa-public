"use strict";

let config;
let knex;

module.exports = Object.assign( add, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

}

function add( entityType, entityUid ) {
};
