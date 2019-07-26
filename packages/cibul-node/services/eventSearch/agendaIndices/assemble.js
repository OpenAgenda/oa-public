"use strict";

/**
 * Search indexes bundle up several information per event to allow richer search functionality.
 *
 * These include:
 *
 *  * The core event data
 *  * Information on the member that contributed the event
 *  * Custom data associated to the event by a specific agenda
 */

const _ = require( 'lodash' );
const VError = require( 'verror' );
const custom = require( '@openagenda/custom' );
const agendas = require( '@openagenda/agendas' );
const ih = require( 'immutability-helper' );
const eventSvc = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const agendaEvents = require( '@openagenda/agenda-events' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const log = require( '@openagenda/logs' )( 'services/eventSearch/assemble' );

const networks = require( '../../networks' );

let knex, maxIndexableTimingCount;

module.exports = {
  list,
  item,
  getCustomValidators,
  init: c => {

    knex = c.knex;

    maxIndexableTimingCount = _.get( c, 'esEvents.maxIndexableTimingCount', 1000 );

  }
}

async function list( agendaEvents, formSchemaId = null, customValidators = null ) {

  const validators = customValidators === null ? await getCustomValidators( formSchemaId ) : customValidators;

  const memberMap = await _getMemberMap( agendaEvents );

  const eventUids = agendaEvents.map( ae => ae.eventUid );

  const customMap = await custom( formSchemaId ).list( { identifier: eventUids } ).then( r => r.items );

  const events = await eventSvc.list( { uid: eventUids }, 0, eventUids.length, { detailed: true, html: true, private: null } ).then( r => r.events );

  const missing = [];

  const assembled = agendaEvents.map( ae => {

    const event = _.find( events, e => e.uid === ae.eventUid );

    if ( !event ) {

      log( 'warn', 'agendaEvent ref %s.%s does not have a matching non-draft event', ae.agendaUid, ae.eventUid );

      missing.push( ae.eventUid );

      return null;

    } else if ( event.timings.length > maxIndexableTimingCount ) {

      log( 'warn', 'max indexable timings is reached, filtering from %s to %s', event.timings.length, maxIndexableTimingCount );

      event.timings = event.timings.slice( 0, maxIndexableTimingCount );

    }

    return _.extend( {}, ae, { event } );

  } )

    .filter( ae => !!ae )

    .map( ae => {

      const custom = _.find( customMap, c => c.identifier === ae.eventUid );

      const assembledItem = _item( {
        event: ae.event,
        validators,
        member: _.find( memberMap, m => m.uid === ae.userUid ),
        custom: custom ? custom.custom : null,
        state: ae.state,
        featured: ae.featured
      } );

      return assembledItem;

    } );

  return {
    assembled,
    missing
  }

}


async function item( agendaEvent ) {

  const event = await _getEvent( agendaEvent );

  if ( !event ) {

    throw new VError( 'event was not found for agendeEvent ref %s.%s', agendaEvent.agendaUid, agendaEvent.eventUid );

  }

  const formSchemaIds = await _getFormSchemaIds( agendaEvent );

  const custom = await _getCustomData( formSchemaIds, agendaEvent.eventUid );

  return _item( {
    event,
    validators: await getCustomValidators( formSchemaIds ),
    member: _.find( await _getMemberMap( [ agendaEvent ] ), m => m.eventUid === agendaEvent.eventUid ),
    custom,
    state: agendaEvent.state,
    featured: agendaEvent.featured
  } );

}

async function _getFormSchemaIds( agendaEvent ) {

  const formSchemaIds = [];

  const { networkUid, formSchemaId } = await agendas.get( {
    uid: agendaEvent.agendaUid
  }, { internal: true } );

  if ( networkUid ) {

    const network = await networks.get( networkUid );

    if ( network && network.formSchemaId ) {

      formSchemaIds.push( network.formSchemaId );

    }

  }

  if ( formSchemaId ) formSchemaIds.push( formSchemaId );

  return formSchemaIds;

}

function _item( { event, validators, member, custom, state, featured } ) {

  const decoration = {};

  if ( member ) {

    decoration.contributor = { $set: member };

  }

  if ( custom ) {

    Object.keys( validators ).forEach( extendedFieldName => {

      decoration[ extendedFieldName ] = { $set: validators[ extendedFieldName ]( custom ) }

    } );

  }

  decoration.state = { $set: { code: state, featured: !!featured } };

  return ih( event, decoration );

}


function _getAgenda( agendaUid, field = null ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { uid: agendaUid }, { internal: true }, ( err, agenda ) => {

      if ( err ) return rj( err );

      if ( !agenda ) return rs( null );

      if ( field === null ) return rs( agenda );

      rs( agenda[ field ] );

    } );

  } );

}


function _getMemberMap( agendaEvents = [] ) {

  if ( !agendaEvents.length ) return [];

  const agendaUid = _.head( agendaEvents.map( ae => ae.agendaUid ) );

  return new Promise( ( rs, rj ) => {

    // agenda & event ids need to be retrieved as stakeholder service does not reference uids.
    agendas.get( { uid: agendaUid }, { internal: true, private: null }, async ( err, agenda ) => {

      if ( err ) return rj( new VError( err, 'could not get agenda %s', agendaUid ) );

      if ( !agenda ) return rj( new VError( 'could not find agenda %s of first agendaEvent %s', agendaUid, JSON.stringify( agendaEvents[ 0 ] ) ) );

      let users = await _getUsersByUid( agendaEvents.map( ae => ae.userUid ).filter( uid => !!uid ) );

      agendaStakeholders( agenda.id ).list( { userId: users.map( u => u.id ) }, ( err, members ) => {

        // we need to stick members to the given agendaEvents. We have the userUid on the ae, the userId on the member.

        rs( agendaEvents.map( ae => {

          const m = {
            eventUid: ae.eventUid,
            member: null
          };

          let user = _.find( users, u => ae.userUid === u.uid );

          if ( !user ) return m;

          let member = _.find( members, m => m.userId === user.id );

          if ( !member ) return m;

          m.member = {
            uid: _.find( users, u => u.id === member.userId ).uid,
            name: member.custom.contactName,
            organization: member.custom.organization
          };

          return m;

        } ).map( m => m.member ).filter( m => !!m ) )

      } );

    } );

  } );

}


/**
 * validators separating custom data by access credentials
 */

async function getCustomValidators( formSchemaIds, level = null ) {

  if ( !formSchemaIds ) return {};

  let fs = await formSchemas.getMerged( formSchemaIds, { instanciate: true } );

  if ( fs === null ) return {};

  return {
    custom: fs.getValidate( 'read' ),
    customAdministrator: fs.getValidate( 'read', 'administrator', { includeUnspecified: false } ),
    customModerator: fs.getValidate( 'read', 'moderator', { includeUnspecified: false } )
  }

}



async function _getCustomData( formSchemaIds, eventUid ) {

  const data = {};

  for ( const formSchemaId of formSchemaIds ) {

    _.assign( data, ( await custom( formSchemaId ).get( eventUid ) ) || {} );

  }

  return data;

}

async function _getNetworkCustomData( networkUid, eventUid ) {

  if ( !networkUid ) return null;

  const network = await networks.get( networkUid );

  if ( !network || !network.formSchemaId ) return null;

  return custom( network.formSchemaId ).get( eventUid );

}


async function _getEvent( agendaEvent ) {

  const result = await eventSvc.list( { uid: agendaEvent.eventUid }, 0, 1, { detailed: true } );

  return _.head( result.events );

}

async function _getUsersByUid( uids ) {

  return knex( 'user' )
    .select( 'id', 'uid' )
    .where( 'uid', 'in', uids )

}
