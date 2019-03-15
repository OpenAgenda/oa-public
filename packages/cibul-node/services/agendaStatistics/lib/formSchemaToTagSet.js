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

  const { id } = await config.knex( 'review' ).first( [ 'id', 'store' ] ).where( 'uid', agenda.uid );

  const tagSet =  await getAgendaTags( id );

  const { tagSet: updatedTagSet, messages } = generateTagSet( schema, tagSet );

  if ( updatedTagSet ) {

    await setAgendaTags( id, updatedTagSet );

    messages.push( 'generated tag set at id ' + id );

  } else {

    messages.push( 'no tag set generated' );

  }

  return {
    messages,
    updatedTagSet,
  }

}
