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
const membersSvc = require('../../members');
const log = require( '@openagenda/logs' )( 'services/eventSearch/assemble' );

const networks = require( '../../networks' );

let knex, maxIndexableTimingCount;

module.exports = ({ esEvents, knex }) => {
  const maxIndexableTimingCount = _.get(esEvents, 'maxIndexableTimingCount', 1000 );

  return {
    list: list.bind(null, { maxIndexableTimingCount }),
    item,
    getCustomValidators
  }
}

async function list({ maxIndexableTimingCount }, agendaEvents, formSchemaId = null, customValidators = null) {

  const validators = customValidators === null ? await getCustomValidators(formSchemaId) : customValidators;

  const eventUids = agendaEvents.map(ae => ae.eventUid);

  const customMap = await custom(formSchemaId)
    .list({ identifier: eventUids })
    .then(r => r.items);

  const events = await eventSvc.list({
    uid: eventUids
  }, 0, eventUids.length, {
    detailed: true,
    html: true,
    private: null
  }).then(r => r.events);

  const missing = [];

  const assembled = agendaEvents.map(ae => {
    const event = _.find(events, e => e.uid === ae.eventUid);

    if (!event) {
      log('warn', 'agendaEvent ref %s.%s does not have a matching non-draft event', ae.agendaUid, ae.eventUid);

      missing.push(ae.eventUid);

      return null;
    } else if (event.timings.length > maxIndexableTimingCount) {

      log('warn', 'max indexable timings is reached, filtering from %s to %s', event.timings.length, maxIndexableTimingCount);

      event.timings = event.timings.slice(0, maxIndexableTimingCount);
    }

    return Object.assign({}, ae, { event });
  } ).filter(ae => !!ae).map(ae => {
      const custom = _.find(customMap, c => c.identifier === ae.eventUid);

      const assembledItem = _item({
        event: ae.event,
        validators,
        member: _parseMember(ae),
        custom: custom ? custom.custom : null,
        state: ae.state,
        featured: ae.featured
      });

      return assembledItem;
    });

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
    member: _parseMember(agendaEvent),
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

/**
 * validators separating custom data by access credentials
 */

async function getCustomValidators(formSchemaIds, level = null) {
  if (!formSchemaIds) return {};

  let fs = await formSchemas.getMerged(formSchemaIds, { instanciate: true });

  if (fs === null) return {};

  return {
    custom: fs.getValidate('read'),
    customAdministrator: fs.getValidate('read', 'administrator', { includeUnspecified: false }),
    customModerator: fs.getValidate('read', 'moderator', { includeUnspecified: false })
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

function _parseMember(ae) {
  return ae.member ? {
    uid: ae.userUid,
    name: _.get(ae, 'member.custom.contactName'),
    organization: _.get(ae, 'member.custom.organization')
  } : null
}
