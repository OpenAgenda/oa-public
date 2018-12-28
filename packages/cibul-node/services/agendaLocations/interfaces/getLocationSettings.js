"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/interfaces/getAgendaLocations' );

const core = require( '../../../core' );

module.exports = async ( agendaId, cb ) => {

  const agenda = await agendas.get( { id: agendaId }, { private: null } );

  if ( !agenda ) return cb( 'agenda not found: ' + agendaId );

  const schema = await core.agendas( agenda.uid ).settings.get();

  if ( !schema || !_.isArray( schema.fields ) ) return cb();

  const locationField = _.first( schema.fields.filter( f => f.field === 'location' ) );

  cb( null, _.get( locationField, 'legacy', null ) );

}
