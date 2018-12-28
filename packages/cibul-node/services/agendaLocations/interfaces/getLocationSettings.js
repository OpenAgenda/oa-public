"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const flattenLocationTagSet = require( '@openagenda/event-form/build/utils/flattenLocationTagSet' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/interfaces/getAgendaLocations' );

const core = require( '../../../core' );

module.exports = async ( agendaId, options, cb ) => {

  const agenda = await agendas.get( { id: agendaId }, { private: null } );

  if ( !agenda ) return cb( 'agenda not found: ' + agendaId );

  const schema = await core.agendas( agenda.uid ).settings.get();

  if ( !schema || !_.isArray( schema.fields ) ) return cb();

  const locationField = _.first( schema.fields.filter( f => f.field === 'location' ) );

  const legacy = _.get( locationField, 'legacy', null );

  if ( !legacy ) return cb();

  if ( legacy.tagSet ) {

    legacy.tagSet = flattenLocationTagSet( legacy.tagSet, _.get( options, 'lang', 'en' ) );

  }

  cb( null, legacy );

}
