"use strict";

const _ = require( 'lodash' );

const custom = require( '@openagenda/custom' );
const networks = require( '@openagenda/networks' );

const log = require( '@openagenda/logs' )( 'agendaEvents/transferCustomFromLegacy' );

module.exports = async ( agenda, event ) => {

  try {

    const network = agenda.networkUid ? await networks.get( agenda.networkUid ) : null;

    const networkFormSchemaId = network ? network.formSchemaId : null;

    if ( agenda.formSchemaId ) {
      await custom( agenda.formSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );
    }

    if ( networkFormSchemaId ) {
      await custom( networkFormSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );
    }

  } catch ( e ) {
    log( 'error', 'could not transfer custom data from legacy (%s.%s)', agenda.uid, event.uid, e );
  }

}
