"use strict";

const _ = require( 'lodash' );

const add = require( './service/add' );
const configStore = require( './service/config' );
const deleteIndex = require( './service/deleteIndex' );
const moreLikeThis = require( './service/moreLikeThis' );
const rebuild = require( './service/rebuild' );
const remove = require( './service/remove' );
const search = require( './service/search' );
const update = require( './service/update' );

module.exports = alias => {

  return {
    name: alias,
    exists: _exists.bind( null, alias ),
    rebuild: rebuild.bind( null, alias ),
    deleteIndex: deleteIndex.bind( null, alias ),
    search: _.extend( search.bind( null, alias ), {
      stream: search.stream.bind( null, alias )
    } ),
    moreLikeThis: moreLikeThis.bind( null, alias ),
    add: add.bind( null, alias ),
    update: update.bind( null, alias ),
    remove: remove.bind( null, alias )
  }

}

module.exports.init = configStore.init;

module.exports.getConfig = () => configStore;


async function _exists( alias ) {

  if ( !configStore.client ) throw new Error( 'Service was not initialized' );

  return configStore.client.indices.existsAlias( {
    name: alias
  } );

}