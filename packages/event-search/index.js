"use strict";

const rebuild = require( './service/rebuild' );
const search = require( './service/search' );
const configStore = require( './service/config' );
const add = require( './service/add' );
const update = require( './service/update' );
const remove = require( './service/remove' );
const deleteIndex = require( './service/deleteIndex' );

module.exports = alias => {

  return {
    name: alias,
    exists: _exists.bind( null, alias ),
    rebuild: rebuild.bind( null, alias ),
    deleteIndex: deleteIndex.bind( null, alias ),

    search: search.bind( null, alias ),
    add: add.bind( null, alias ),
    update: update.bind( null, alias ),
    remove: remove.bind( null, alias )
  }

}

module.exports.init = configStore.init;

module.exports.getConfig = () => configStore;


async function _exists( alias ) {

  return configStore.client.indices.existsAlias( {
    name: alias
  } );

}