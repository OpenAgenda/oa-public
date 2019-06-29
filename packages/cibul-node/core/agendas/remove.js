"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const removeAgenda = promisify( require( '@openagenda/agendas' ).remove );

module.exports = async ( agendaOrUid, options = {} ) => {

  const agendaUid = _.isObject( agendaOrUid ) ? agendaOrUid.uid : agendaOrUid;

  const { success } = await removeAgenda( { uid: agendaUid } );

  if ( !success ) throw new Error( 'could not remove agenda' );

}
