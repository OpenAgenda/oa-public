"use strict";

var model = require( '../../model' ),

  utils = require( '../../../lib/utils' ),

  w = require( 'when' ),

  extAgendaSvc = require( '@openagenda/agendas' ),

  activitiesSvc = require( '../../activities' ),

  eventSvc = require( '../../event' ),

  search = require( './search' ),

  sources = require( './sources' ),

  async = require( 'async' ),

  log = require( '@openagenda/logs' )( 'services/agenda/instance' ),

  cache = require( '../../cache' ),

  flattener = require( './flattener' ),

  emailStrategie = require( './emailStrategie' ),

  groupActions = require( './groupActions' ),

  coms = require( '../../../lib/coms' ),

  config = require( '../../../config' ),

  onRefresh;

module.exports = instanciate;

module.exports.test = {
  setOnRefresh
}

function instanciate( data ) {

  var instance = model.agendas().instance( data ),

    svcInstance = utils.extend( {}, instance, {
      addEvent,
      removeEvent,
      getContributionSettings,
      setEventFeatured,
      setEventUnfeatured,
      setEventTagsAndCategory,
      announceEventUpdate,
      setContributor: _stakeholderSetter( 'setContributor' ),
      setModerator: _stakeholderSetter( 'setModerator' ),
      setAdministrator: _stakeholderSetter( 'setAdministrator' ),
      unsetContributor: _stakeholderSetter( 'unsetContributor' ),
      unsetModerator: _stakeholderSetter( 'unsetModerator' ),
      unsetAdministrator: _stakeholderSetter( 'unsetAdministrator' ),
      events: {
        new: newEvent,
        list: instance.events.list,
        get: instance.events.get
      },
      refresh,
      refreshUpdatedAt
    } );

  search( svcInstance, instance, [
    'search',
    'searchStream',
    'aggregate',
    'resync'
  ] );

  sources( svcInstance, instance, [
    'sources.add',
    'sources.remove'
  ] );

  flattener( svcInstance, instance, [
    'flattener'
  ] );

  emailStrategie( svcInstance, instance, [
    'emailStrategie'
  ] );

  groupActions( svcInstance, instance, [
    'changeEventStates'
  ] );

  return cache( 'agenda', svcInstance, [], [ 'addEvent', 'removeEvent' ] );


  function refresh( cb ) {

    log( 'refreshing agenda id %s', instance.id );

    if ( onRefresh ) onRefresh( instance.id, options );

    coms.publish( config.mainChannel, {
      name: 'agenda.update',
      values: {
        id: instance.id,
        type: 'refresh'
      }
    } );

    if ( cb ) return cb();

  }


  function refreshUpdatedAt() {

    instance.save( { updatedAt: new Date() }, err => {

      if ( err ) {

        log( 'error', 'could not clear timestamp of agenda %s: %s', instance.id, err );

      }

    } );

  }


  /**
   * add an event to an agenda; same hoop jumping
   * than one described for removeEvent
   */
  function addEvent( event, options, cb ) {

    if ( options.id ) {

      return addEvent( event, { stakeholder: options }, cb );

    }

    const params = utils.extend( {
      stakeholder: null, // required!
      refresh: true,
      mute: false,
      publish: true,
      state: undefined // when defined, publish param is ignored
    }, options );

    instance.isStakeholder( params.stakeholder, ( err, is ) => {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.addEvent( event, params.stakeholder, { publish: params.publish, state: params.state }, err => {

        if ( err ) return cb( err );

        activitiesSvc.feed( { entityType: 'agenda', entityUid: instance.uid } )
          .follow( { entityType: 'event', entityUid: event.uid }, () => {

            if ( params.mute ) return cb();

            announceEventUpdate( event, {
              type: 'event.publish',
              refresh: params.refresh
            } );

            cb();

          } );

      } );

    } );

  }

  function newEvent( cb ) {

    var newEventInst = eventSvc.instanciate( instance.events.new() );

    if ( cb ) cb( null, newEventInst );

    return newEventInst;

  }


  /**
   * remove event from agenda. Need to jump through hoops
   * as legacy code took stakeholder as second arg.
   */
  function removeEvent( event, options, cb ) {

    if ( arguments.length == 3 && options.id !== undefined ) {

      return removeEvent( event, { stakeholder: options }, cb );

    }

    if ( arguments.length === 2 ) {

      cb = options;
      options = {};

    }

    w( utils.extend( {
      agenda: instance,
      event,
      stakeholder: null,
      sourceAgendaUid: null,
      refresh: true
    }, options ) )

      .then( _checkIsStakeholder )

      .done( v => {

        instance.removeEvent( v.event, ( err, count ) => {

          if ( err ) return cb( err );

          announceEventUpdate( v.event, {
            type: 'event.remove',
            refresh: v.refresh,
            userId: ( v.stakeholder && v.stakeholder.id ) || null,
            sourceAgendaUid: v.sourceAgendaUid
          } );

          cb();

        } );

      }, cb );

  }


  function setEventTagsAndCategory( event, tags, category, cb ) {

    instance.assignCategory( category, event, err => {

      if ( err ) return cb( err );

      instance.unassignTags( event, err => {

        if ( err ) return cb( err );

        async.eachSeries( tags, ( tag, ecb ) => {

          instance.assignTag( tag, event, ecb );

        }, err => {

          if ( err ) return cb( err );

          announceEventUpdate( event, {
            type: 'event.tagsAndCategory'
          } );

          cb();

        } );

      } );

    } );

  }


  function setEventFeatured( event, cb ) {

    event.setFeatured( true, err => {

      if ( !err ) {

        announceEventUpdate( event, {
          type: 'event.featured'
        } );

      }

      cb( err );

    } );

  }

  function setEventUnfeatured( event, cb ) {

    event.setUnfeatured( true, err => {

      if ( !err ) {

        announceEventUpdate( event, {
          type: 'event.unfeatured'
        } );

      }

      cb( err );

    } );

  }


  /**
   * when multiple actions are done on an event
   * it is more efficient to prevent an update
   * for each action and trigger it only at the end
   * of the operation. That is the use of this
   * method
   */
  function announceEventUpdate( event, values ) {

    coms.publish( config.mainChannel, {
      name: 'event.update',
      values: Object.assign( {
        type: 'event.publish',
        id: event.id,
        agendaId: instance.id,
      }, values )
    } );

  }


  function getContributionSettings( cb ) {

    extAgendaSvc.get( { id: instance.id }, { private: null }, ( err, agenda ) => {

      if ( err || !agenda ) return cb( err || 'agenda not found' );

      cb( null, agenda.settings.contribution );

    } );

  }


  /**
   * proxy method to db instance; does a little refresh on the way
   */

  function _stakeholderSetter( methodName ) {

    return function ( user, options, cb ) {

      if ( arguments.length === 2 ) {

        cb = options;
        options = {};

      }

      instance[ methodName ]( user, options, err => {

        if ( err ) return cb( err );

        coms.publish( config.mainChannel, {
          name: 'agenda.update',
          values: {
            id: instance.id,
            userId: user.id,
            type: ( {
              setContributor: 'contributor.set',
              setModerator: 'moderator.set',
              setAdministrator: 'administrator.set',
              unsetAdministrator: 'administrator.unset',
              unsetModerator: 'moderator.unset',
              unsetContributor: 'contributor.unset'
            } )[ methodName ]
          }
        } );

        cb();

      } );

    };

  }

}

function setOnRefresh( cb ) {

  onRefresh = cb;

}


function _checkIsStakeholder( v ) {

  if ( !v.stakeholder ) return v;

  let d = w.defer();

  v.agenda.isStakeholder( v.stakeholder, ( err, is ) => {

    if ( err ) return d.reject( err );

    if ( !is ) return d.reject( 'you cannot contribute to this agenda' );

    d.resolve( v );

  } );

  return d.promise;

}
