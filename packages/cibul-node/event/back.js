"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const w = require( 'when' );

const agendaEvents = require( '@openagenda/agenda-events' );
const agendaSvc = require( '@openagenda/agendas' );
const contributorLabels = require( '@openagenda/labels/event/contributors' );
const eventReferences = require( '@openagenda/agenda-event-references' );
const sessions = require( '@openagenda/sessions' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/event/states' ) );

const core = require( '../core' );
const cmn = require( '../lib/commons-app' );
const eventSvc = require( '../services/event' );
const legacyAgendaSvc = require( '../services/agenda' );
const activitiesSvc = require( '../services/activities' );
const STATETYPES = require( '../services/model' ).events().STATETYPES;

const getAgendaTags = promisify( require( '@openagenda/agenda-tags' ).get );


module.exports = app => {

  app.get(
    '/:slug/events/:eventSlug/featured/:type',
    legacyAgendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkAdminOrModerator,
    _checkAuthorizedChanges( [ 'featured', 'notfeatured' ] ),
    _changeFeatured,
    _redirect
  );

  app.get(
    '/agendas/:uid/events/:eventUid/custom',
    legacyAgendaSvc.mw.load( 'uid' ),
    cmn.nonBlockingLoadMemberRole.bind( null, 'agenda' ),
    ( req, res, next ) => {

      core.agendas( req.agenda.uid ).events.get( req.params.eventUid, {
        customOnly: true,
        includeSchema: true,
        access: req.role || 'nobody',
      } ).then( result => res.json( result ) );

    }
  );

  app.get(
    '/agendas/:uid/events/:eventUid/private',
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    cmn.nonBlockingLoadMemberRole.bind( null, 'agenda' ),
    ( req, res, next ) => {

      if ( ![ 'contributor', 'moderator', 'administrator' ].includes( req.role ) ) {

        return res.sendStatus( 403 );

      }

      next();

    },
    eventSvc.mw.format,
    legacyAgendaSvc.mw.decorateEvent( true ),
    getPrivateEventData
  );

  app.get(
    '/agendas/:uid/events/:eventUid/references',
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _loadAdminOrModerator,
    eventSvc.mw.components.getReferences,
    ( req, res, next ) => {

      res.json( {
        references: req.referencesRender,
        events: _monolingual( _.get( req, 'references', [] ), [ 'title', 'dateRange', 'description' ], req.lang )
      } );

    }
  );

  app.get(
    '/agendas/:uid/events',
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
    legacyAgendaSvc.mw.load( 'uid' ),
    ( req, res, next ) => {

      req.agendaId = req.agenda.id;

      next();

    },
    _loadAdminOrModerator,
    eventReferences.mw.events,
    ( req, res ) => res.json( _.pick( req, [ 'events' ] ) )
  );

  app.get(
    [ '/agendas/:uid/events/suggestions', '/agendas/:uid/events/:eventUid/suggestions' ],
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
    ( req, res, next ) => {

      req.agendaUid = req.params.uid;

      if ( req.params.eventUid ) {

        req.query.exclude = [ req.params.eventUid ].concat( req.query.exclude || [] );

      }

      core.agendas( req.params.uid ).settings.get().then( settings => {

        req.formSchemaFields = _.get( settings, 'fields', [] );

        next();

      }, next );

    },
    eventReferences.mw.suggestions,
    ( req, res ) => res.json( {
      events: _monolingual(
        req.events.slice( 0, parseInt( _.get( req.query, 'limit', 20 ) ) ),
        [ 'title', 'dateRange', 'description' ],
        req.lang
      )
    } )
  );

  app.get(
    '/agendas/:uid/events/:eventUid/activities',
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    cmn.checkAdminOrModerator,
    ( req, res, next ) => {

      const limit = 20;

      const feed = activitiesSvc.feed( {
        entityType: 'agenda',
        entityUid: req.agenda.uid
      } );

      feed.get().then( data => {

        if ( !data ) return res.json( {} );

        feed.activities.list(
          { object: 'event:' + req.event.uid },
          req.query.fromId || 0,
          limit
        )

          .then( activities => {

            const lastPage = activities.length < limit;

            res.json( {
              activities,
              count: activities.length,
              nextUrl: lastPage
                ? null
                : `/agendas/${req.agenda.uid}/events/${req.event.uid}/activities?fromId=${activities[ activities.length - 1 ].id}`
            } );

          } )

          .catch( next );

      } );

    }
  );

}



function _monolingual( events, multilingualFields, preferredLang = 'en' ) {

  return events.map( ev => _.keys( ev )
    .reduce( ( e, k ) => _.set( e, k, multilingualFields.includes( k ) ?
      _.get( ev, [ k, preferredLang ], ev[ k ][ _.first( _.keys( ev[ k ] ) ) ] )
      : ev[ k ] )
    , {} ) );

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

    redirectUrl = cmn.getRedirect( req );

  } else if ( req.agenda ) {

    query.slug = req.agenda.slug;

    redirectUrl = req.genUrl( 'agendaEventShow', query );

  } else {

    redirectUrl = req.genUrl( 'eventShow', query );

  }

  req.log( 'redirecting to %s', redirectUrl );

  res.redirect( redirectUrl );

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
