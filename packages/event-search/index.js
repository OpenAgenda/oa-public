"use strict";

const rebuild = require( './service/rebuild' );
const search = require( './service/search' );
const configStore = require( './service/config' );

module.exports = alias => {

  return {
    rebuild: rebuild.bind( null, alias ),
    search: search.bind( null, alias )
  }

}

module.exports.init = configStore.init;

module.exports.getClient = () => configStore.get().client