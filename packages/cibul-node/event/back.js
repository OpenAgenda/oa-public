"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const w = require( 'when' );

const agendaEvents = require( '@openagenda/agenda-events' );
const agendaSvc = require( '@openagenda/agendas' );
const contributorLabels = require( '@openagenda/labels/event/contributors' );
const eventReferences = require( '@openagenda/agenda-event-references' );
const formSchemas = require( '@openagenda/form-schemas' );
const sessions = require( '@openagenda/sessions' );
const customSvc = require( '@openagenda/custom' );

const modLib = require( '../lib/moduleLib' );
const cmn = require( '../lib/commons-app' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/event/states' ) );
const eventSvc = require( '../services/event' );
const legacyAgendaSvc = require( '../services/agenda' );
const STATETYPES = require( '../services/model' ).events().STATETYPES;

const activitiesSvc = require( '@openagenda/activities' );

const getAgendaTags = promisify( require( '@openagenda/agenda-tags' ).get );

const routes = {
  eventChangeState: [ 'get', '/events/:eventSlug/state/:type', [
    legacyAgendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.checkEventEditor,
    _checkAuthorizedChanges( [ STATETYPES.PUBLISHED ] ),
    _changeState,
    _redirect
  ] ],

  agendaEventChangeState: [ 'get', '/:slug/events/:eventSlug/state/:type', [
    legacyAgendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _checkAuthorizedChanges( [ STATETYPES.VALIDATED, STATETYPES.NOTVALIDATED, STATETYPES.PUBLISHED, STATETYPES.REFUSED ] ),
    _changeStateCredential,
    _changeState,
    _xhrResponse,
    _redirect
  ] ],

  agendaEventChangeFeatured: [ 'get', '/:slug/events/:eventSlug/featured/:type', [
    legacyAgendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkAdminOrModerator,
    _checkAuthorizedChanges( [ 'featured', 'notfeatured' ] ),
    _changeFeatured,
    _redirect
  ] ],

  agendaEventPrivate: [ 'get', '/agendas/:uid/events/:eventUid/private', [
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    cmn.loadMemberRole.bind( null, 'agenda' ),
    ( req, res, next ) => {

      if ( ![ 'contributor', 'moderator', 'administrator' ].includes( req.role ) ) {

        return res.sendStatus( 403 );

      }

      next();

    },
    eventSvc.mw.format,
    legacyAgendaSvc.mw.decorateEvent( true ),
    getPrivateEventData
  ] ],

  agendaEventReferences: [ 'get', '/agendas/:uid/events/:eventUid/references', [
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _loadAdminOrModerator,
    eventSvc.mw.components.getReferences,
    ( req, res, next ) => {

      res.json( {
        references: req.referencesRender
      } );

    }
  ] ],

  // this name does not imply reference search
  // suggestions are part of new search in their own file
  agendaEventReferenceSearch: [ 'get', '/agendas/:uid/events', [
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    legacyAgendaSvc.mw.load( 'uid' ),
    ( req, res, next ) => {

      req.agendaId = req.agenda.id;

      next();

    },
    _loadAdminOrModerator,
    eventReferences.mw.events,
    ( req, res ) => res.json( req.events )
    
  ] ],

  agendaEventReferenceSuggestion: [ 'get', '/agendas/:uid/events/suggestions', [
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    agendaSvc.middleware.load( {
      namespaces: {
        identifiers: {
          uid: 'params.uid'
        },
        result: 'agenda'
      },
      internal: true,
      private: null
    } ),
    ( req, res, next ) => {

      ( req.agenda.formSchemaId
        ? formSchemas.get( req.agenda.formSchemaId )
        : formSchemas.legacy.get( req.agenda.id ) ).then( fs => {

        req.formSchemaFields = fs.fields;

        next();

      }, next );

    },
    ( req, res, next ) => {

      req.agendaUid = req.params.uid;

      const custom = customSvc.parseLegacy( req.formSchemaFields, {
        custom: _.get( req, 'query.sample.custom', null ),
        tags: _.get( req, 'query.sample.tags', [] ).map( t => t.label ),
        category: _.get( req, 'query.sample.category.label', null )
      } );

      req.query.sample = _.assignIn( _.omit( req.query.sample, [ 'custom', 'tags', 'category' ] ), { custom } );

      next();

    },
    eventReferences.mw.suggestions,
    ( req, res ) => res.json( req.events )
  ] ],

  agendaEventActivities: [ 'get', '/agendas/:uid/events/:eventUid/activities', [
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    cmn.checkAdminOrModerator,
    ( req, res, next ) => {

      const limit = 20;

      const feed = activitiesSvc.feed( {
        entityType: 'event',
        entityUid: req.event.uid
      } );

      feed.get().then( data => {

        if ( !data ) return res.json( {} );

        feed.activities.list( req.query.fromId || 0, limit )
        
          .then( activities => {

            const lastPage = activities.length < limit;

            res.json( {
              activities,
              count: activities.length,
              nextUrl: lastPage ? null : req.genUrl( 'agendaEventActivities', {
                uid: req.agenda.uid,
                eventUid: req.event.uid,
                fromId: activities[ activities.length - 1 ].id
              } )
            } );

          } )

          .catch( next );

      } );

    }
  ] ],

};


module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function getPrivateEventData( req, res, next ) {

  w( {
    req,
    res,
    custom: req.formatted.custom
      .filter( _filterByRole.bind( null, req.role ) )
      .filter( c => c.access !== 'public' ),
    labels: req.formatted.customLabels,
    contributor: false
  } )

    // get tag groups info
    .then( async v => {

      v.tagSet = ( await getAgendaTags( v.req.agenda.id ) ) || null;

      if ( !v.tagSet ) return v;

      const tags = await promisify( v.req.event.getAgendaTags )( v.req.agenda.id );

      v.tagGroups = v.tagSet.groups.map( g => ( {
        name: g.name,
        access: g.access || 'public',
        tags: g.tags.filter( t => tags.map( t => t.id ).includes( t.id ) )
      } ) ).filter( _filterByRole.bind( null, req.role ) );

      return v;            

    } )

    // get contributor info
    .then( v => {

      const d = w.defer();

      req.event.getContributorInfo( ( err, contributorInfo ) => {

        if ( err ) return d.reject( err );

        if ( contributorInfo && contributorInfo.organizationSlug ) {

          contributorInfo.organizationSlug = undefined;

        }

        v.contributor = contributorInfo || {};

        d.resolve( v );

      } );

      return d.promise;

    } )

    .done( v => {

      cmn.renderJson( req, res, {
        custom: {
          custom: v.custom,
          labels: v.labels
        },
        contributor: {
          data: v.contributor,
          labels: {
            organization: contributorLabels.organization[ req.lang ],
            contactNumber: contributorLabels.contactNumber[ req.lang ],
            contactName: contributorLabels.contactName[ req.lang ],
            contactPosition: contributorLabels.contactPosition[ req.lang ]
          }
        },
        tagGroups: v.tagGroups
      } );

    }, next );

}


function _filterByRole( role, item ) {

  if ( item.access === 'administrator' ) {

    return [ 'administrator', 'moderator' ].includes( role );

  }

  return true;

}


function _xhrResponse( req, res, next ) {

  if ( req.xhr ) {

    cmn.renderJson( req, res, { success: true } );

  } else {

    next();

  }

}

function _redirect( req, res ) {

  const query = { eventSlug: req.event.slug };

  let redirectUrl;

  if ( req.query.redirect ) {

    redirectUrl = req.query.redirect;

  } else if ( req.agenda ) {

    query.slug = req.agenda.slug;

    redirectUrl = req.genUrl( 'agendaEventShow', query );

  } else {

    redirectUrl = req.genUrl( 'eventShow', query );

  }

  req.log( 'redirecting to %s', redirectUrl );

  res.redirect( redirectUrl );

}


function _changeStateCredential( req, res, next ) {

  if ( parseInt( req.params.type ) !== STATETYPES.PUBLISHED ) {

    cmn.checkAdminOrModerator( req, res, next );

  } else {

    agendaSvc.get( { uid: req.agenda.uid }, { private: null }, ( err, agenda ) => {

      const moderatorsCanPublish = _.get( agenda, 'settings.contribution.canPublish', [ 'moderators', 'administrators' ] ).includes( 'moderators' );

      if ( moderatorsCanPublish ) return cmn.checkAdminOrModerator( req, res, next );

      cmn.checkAdministrator( {
        message: 'Only agenda administrators may publish events',
        redirect: req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } )
      } )( req, res, next );

    } );

  }

}


function _changeState( req, res, next ) {

  req.log( 'updating state to %s', req.params.type );

  agendaEvents( req.agenda.uid ).update( req.event.uid, {
    state: req.params.type
  }, {
    context: {
      userUid: req.user.uid
    }
  } );

  req.event.setState( req.params.type, function ( err, result, { oldState, newState } ) {

    if ( err ) {

      return next( { code: 500 } );

    }

    oldState = parseInt( oldState );
    newState = parseInt( newState );

    if ( !req.xhr ) {

      sessions.setFlash( req, res, __( 'stateChanged', req.lang ) );

    }

    if ( newState === 2 || oldState === 2 ) {

      activitiesSvc.feed( { entityType: 'event', entityUid: req.event.uid } ).activities.add( {
        actor: 'user:' + req.user.uid,
        verb: 'agenda.' + ( newState === 2 ? 'publish' : 'unpublish' ) + 'Event',
        object: 'event:' + req.event.uid,
        target: 'agenda:' + req.agenda.uid,
        store: {
          labels: {
            actor: req.user.name,
            object: req.event.title,
            target: req.agenda.title
          },
          // origin is not always set. When the event was created by script for example.
          originAgendaUid: req.event.origin ? req.event.origin.uid : null
        }
      }, () => {

        next();

      } );

    } else {

      activitiesSvc.feed( { entityType: 'agenda', entityUid: req.agenda.uid } ).activities.add( {
        actor: 'user:' + req.user.uid,
        verb: 'agenda.changeEventState',
        object: 'event:' + req.event.uid,
        target: 'agenda:' + req.agenda.uid,
        store: {
          labels: {
            actor: req.user.name,
            object: req.event.title,
            target: req.agenda.title
          },
          oldState,
          newState
        }
      }, () => {

        next();

      } );

    }

  } );

}


function _changeFeatured( req, res, next ) {

  const funcs = {
    featured: req.agenda.setEventFeatured,
    notfeatured: req.agenda.setEventUnfeatured
  };

  req.log( 'updating featured to %s', req.params.type );

  agendaEvents( req.agenda.uid ).update( req.event.uid, {
    featured: req.params.type === 'featured'
  }, { context: { userUid: req.user.uid } } );

  funcs[ req.params.type ]( req.event, err => {

    if ( err ) {

      return next( { code: 500 } );

    }

    sessions.setFlash( req, res, __( req.params.type === 'featured' ? 'featuredChange' : 'unfeaturedChange', req.lang ) );

    next();

  } );

}


function _checkAuthorizedChanges( authorizedTypes ) {

  return function ( req, res, next ) {

    req.log( 'checking authorized changes for type %s', req.params.type );

    let type = req.params.type;

    if ( type == parseInt( type, 10 ) ) {

      type = parseInt( type, 10 );

    }

    if ( authorizedTypes.indexOf( type ) == -1 ) {

      req.log( 'type is not authorized: %s', req.params.type );

      return next( { code: 403 } );

    }

    req.log( 'type is authorized: %s', req.params.type );

    next();

  }

}

function _loadAdminOrModerator( req, res, next ) {

  // load req.access without throwing error
  cmn.checkAdminOrModerator( req, res, err => {

    next();

  } );

}