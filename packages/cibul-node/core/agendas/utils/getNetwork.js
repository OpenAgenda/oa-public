"use strict";

const { promisify } = require( 'util' );
const VError = require( 'verror' );

const networks = require( '../../../services/networks' );

module.exports = async networkUid => {

  if ( !networkUid ) return null;

  const network = await networks.get( networkUid );

  if ( !network ) {

    throw new VError( 'network of uid %d was not found', networkUid );

  }

  return network;

}
