"use strict";

const core = require( '../../../core' );
const log = require( '@openagenda/logs' )( 'events/interfaces/setSchema' );

module.exports = async ( agenda, fields ) => {

  return core.agendas( agenda.uid ).settings.schema.updateFields( fields );

}
