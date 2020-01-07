"use strict";

const w = require('when');
const async = require('async');
const createIndexName = require('./createIndexName');

const log = require('@openagenda/logs')('helpers/_createUniqueIndex');

/**
 * create index name and test uniqueness
 */
module.exports = async function(client, alias, settings) {
  log('creating for alias %s', alias);
  const indexName = await _createUniqueIndexName(client, alias);

  log('created %s', indexName);
  return _createIndex( client, indexName, settings );

}


async function _createUniqueIndexName(client, alias, cb) {
  const baseName = createIndexName(alias);
  let suffix = '';

  do {
    if (!await _exists(client, baseName + suffix)) {
      return baseName + suffix;
    }
    suffix = '_' + Math.ceil(Math.random() * 1000);
  } while (true);
}


function _exists( client, index ) {
  return new Promise((rs, rj) => {
    client.indices.exists({ index }, (err, { body }) => {
      if (err) return rj(err);
      rs(body);
    });
  });
}


function _createIndex(client, indexName, settings) {

  let d = w.defer();

  client.indices.create({
    index: indexName,
    body: settings
  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( indexName );

  } );

  return d.promise;

}
