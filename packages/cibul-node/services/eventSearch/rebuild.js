"use strict";

const search = require( 'event-search' );

const agendas = require( 'agendas' );

const formSchemas = require( 'form-schemas' );

const eventSvc = require( 'events-service' );

const agendaEvents = require( 'agenda-events' );

const users = require( 'users' );

const agendaStakeholders = require( 'agenda-stakeholders' );

const custom = require( 'custom' );

const VError = require( 'verror' );

const _ = require( 'lodash' );

let knex;

module.exports = async ( { uid, formSchemaId } ) => {

  const validators = await _getCustomValidators( formSchemaId );

  const extensions = {
    custom: validators.custom ? validators.custom.fields : null,
    customAdministrator: validators.customAdministrator ? validators.customAdministrator.fields : null,
    customModerator: validators.customModerator ? validators.customModerator.fields : null
  }

  return search( `agendas:${uid}` ).rebuild( {
    eventsList: _eventsList.bind( null, uid, formSchemaId, validators ),
    extensions
  } );

}

module.exports.init = c => {

  knex = c.knex;

}


/**
 * retrieve fields corresponding to given form schema id
 */
async function _getCustomValidators( formSchemaId, level = null ) {

  if ( !formSchemaId ) return {};

  let fs = await formSchemas.get( formSchemaId, { instanciate: true } );

  if ( fs === null ) return {};

  return {
    custom: fs.getValidate( 'read' ),
    customAdministrator: fs.getValidate( 'read', 'administrator', { includeUnspecified: false } ),
    customModerator: fs.getValidate( 'read', 'moderator', { includeUnspecified: false } )
  }

}


function _appendCustomData( item, data, validators = {} ) {

  [ 'custom', 'customAdministrator', 'customModerator' ].forEach( k => {

    if ( validators[ k ] ) {

      item[ k ] = validators[ k ]( data );

    }

  } );

}


async function _eventsList( agendaUid, formSchemaId, customValidators = null, offset, limit ) {

  // get references for offset limit
  
  let aes = await agendaEvents( agendaUid ).list( offset, limit ).then( r => r.items ),

    eventUids = aes.map( ae => ae.eventUid ),
  
  // get base event data
  
    items = await eventSvc.list( { uid: eventUids }, 0, eventUids.length, { detailed: true } ).then( r => r.events ),

  // decorate events with custom data
  
    customData = await custom( formSchemaId ).list( { identifier: eventUids } ).then( r => r.items );

  // decorate events with contributor data
  aes = await _addMemberMap( agendaUid, aes );

  return items.map( i => {

    // if custom data is associated to event, clean it and add it in key specific to its access
    let customMatches = customData.filter( c => c.identifier === i.uid );

    if ( customMatches.length ) {

      _appendCustomData( i, customMatches[ 0 ].custom, customValidators );

    }

    // add contributor info to event item
    let aesMatches = aes.filter( ae => ae.eventUid === i.uid );

    if ( aesMatches.length ) {

      if ( aesMatches[ 0 ].member ) {

        // bit of wiring here
        i.contributor = {
          uid: aesMatches[ 0 ].userUid,
          name: aesMatches[ 0 ].member.custom.contactName,
          organization: aesMatches[ 0 ].member.custom.organization
        }

      }

    }

    return i;

  } );

}

function _addMemberMap( agendaUid, aes ) {

  return new Promise( ( rs, rj ) => {

    // agenda & event ids need to be retrieved as stakeholder service does not reference uids.
    agendas.get( { uid: agendaUid }, { internal: true }, async ( err, agenda ) => {

      if ( err ) return rj( new VError( err, 'could not get agenda %s', agendaUid ) );

      if ( !agenda ) return rj( new Error( 'could not find agenda ' + agendaUid ) );

      // no need to index internal data.
      let events = await eventSvc.list( { uid: aes.map( ae => ae.eventUid ) }, 0, aes.length, { internal: true } ).then( r => r.events );

      let users = await _getUsersByUid( aes.map( ae => ae.userUid ) );

      agendaStakeholders( agenda.id ).list( { userId: users.map( u => u.id ) }, ( err, members ) => {

        // add userId & eventId references to aes
        
        aes.forEach( ae => {

          let eventMatches = events.filter( e => e.uid === ae.eventUid );

          let userMatches = users.filter( u => u.uid === ae.userUid );

          if ( eventMatches.length ) {

            ae.eventId = eventMatches[ 0 ].id;

          }

          if ( userMatches.length ) {

            let memberMatches = members.filter( m => m.userId === userMatches[ 0 ].id );

            if ( memberMatches.length ) {

              ae.member = memberMatches[ 0 ];

            }

          }

        } );

        rs( aes );

      } );

    } );

  } );

}


async function _getUsersByUid( uids ) {

  return knex( 'user' )
    .select( 'id', 'uid' )
    .where( 'uid', 'in', uids )

}