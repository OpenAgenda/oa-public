"use strict";

const _ = require( 'lodash' );
const add = require( './service/add' );
const search = require( './service/search' );
const remove = require( './service/remove' );
const update = require( './service/update' );
const rebuild = require( './service/rebuild' );
const configStore = require( './service/config' );
const deleteIndex = require( './service/deleteIndex' );

module.exports = alias => {

  return {
    name: alias,
    exists: _exists.bind( null, alias ),
    rebuild: rebuild.bind( null, alias ),
    deleteIndex: deleteIndex.bind( null, alias ),
    search: _.extend( search.bind( null, alias ), {
      stream: search.stream.bind( null, alias )
    } ),
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