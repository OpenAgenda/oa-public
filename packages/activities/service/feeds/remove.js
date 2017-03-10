"use strict";

let config;
let knex;

module.exports = Object.assign( remove, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

}

function remove( entityType, entityUid ) {
};
