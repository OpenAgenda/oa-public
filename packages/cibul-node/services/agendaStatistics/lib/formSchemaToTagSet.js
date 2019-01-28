"use strict";

const { promisify } = require( 'util' );

const agendaTags = require( '@openagenda/agenda-tags' );
const config = require( '../../../config' );
const generateTagSet = require( '@openagenda/form-schemas/server/legacy/generateTagSet' );

const getMergedSchema = require( './getMergedSchema' );

const setAgendaTags = promisify( agendaTags.set );
const getAgendaTags = promisify( agendaTags.get );

const log = require( '@openagenda/logs' )( 'services/agendaStatistics/formSchemaToLegacy' );

module.exports = async ( agenda, force = false ) => {

  log( 'transferring from form-schema to tag-set and custom fields', agenda.uid );

  const schema = await getMergedSchema( agenda );

  if ( !schema ) return { message: `No schema was found for agenda ${agenda.uid}` };

  const tagSet = generateTagSet( schema );

  const { id } = await config.knex( 'review' ).first( [ 'id', 'store' ] ).where( 'uid', agenda.uid );

  if ( !force && await getAgendaTags( id ) ) {

    return {
      message: 'tag set already exists for agenda. ?force to force operation'
    }

  }

  if ( tagSet ) await setAgendaTags( id, tagSet );

  return {
    message: 'generated tag set at id ' + id,
    tagSet,
  }

}
