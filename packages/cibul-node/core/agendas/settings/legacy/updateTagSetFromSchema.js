"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendaTags = require( '@openagenda/agenda-tags' );
const generateTagSet = require( '@openagenda/legacy/tagsAndCustom' ).utils.generateTagSet;

const getAgenda = require( '../../utils/getAgenda' );
const getMergedSchema = require( '../getMergedSchema' );
const setSchemaFieldOrigins = require( './setSchemaFieldOrigins' );

const setAgendaTags = promisify( agendaTags.set );
const getAgendaTags = promisify( agendaTags.get );

const log = require( '@openagenda/logs' )( 'core/agendas/settings/legacy/updateTagSet' );

module.exports = async ( config, agendaOrUid, force = false ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  log( 'transferring from form-schema to tag-set and custom fields', agenda.uid, agenda.slug );

  const schema = await getMergedSchema( agenda );

  if ( !schema ) return { message: `No schema was found for agenda ${agenda.uid}` };

  const { id } = await config.knex( 'review' ).first( [ 'id' ] ).where( 'uid', agenda.uid );

  const tagSet = await getAgendaTags( id );

  const { tagSet: updatedTagSet, messages, fields } = generateTagSet( schema, tagSet );

  const res = {
    messages,
    updatedTagSet
  }

  if ( !updatedTagSet ) {

    res.messages.push( 'no tag set generated' );

    return res;

  }

  log( 'updated tag set has %s groups', updatedTagSet.groups.length );

  await setAgendaTags( id, updatedTagSet );

  res.messages.push( 'generated tag set at id ' + id );

  if ( updatedTagSet.groups.length ) {

    const {
      message: schemaUpdateMessage,
      schema: updatedSchema
    } = await setSchemaFieldOrigins( agenda, fields.map( f => f.field ), 'tags' );

    res.messages.push( schemaUpdateMessage );

    res.updatedSchema = updatedSchema;

  }

  return res;

}
