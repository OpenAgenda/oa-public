"use strict";

let config;
let knex;

module.exports = Object.assign( follow, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

}

function follow( entityType, entityUid ) {
};
