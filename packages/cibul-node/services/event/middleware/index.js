"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );

const agendas = require( '@openagenda/agendas' );
const sessions = require( '@openagenda/sessions' );
const utils = require( '@openagenda/utils' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );

const log = require( '@openagenda/logger' )( 'event middleware' );

const config = require( '../../../config' );
const i18n = require( '../../../i18n/i18n' );
const p = require( '../../../lib/promises' );
const w = p.w;

let svc;

module.exports = function( eventService ) {

  svc = eventService;

  return {
    load: loadEvent,
    loadUris,
    format: require( './format' ),
    components: require( './components' ),
    cleanEvents,
    search,
    checkEventEditor,
    layoutData,
    ics
  }

}


/**
 * load event instance and set it in req.event
 */

function loadEvent( paramName, fieldName, options ) {

  const params = _.extend( { 
    inAgendaContext: true // if agenda is in request and event must not be loaded in agenda context, use this
  }, options || {} );

  return ( req, res, next ) => {

    w( {
      req,
      res,
      event: false,
      accessRequired: null,
      inAgendaContext: params.inAgendaContext,
      user: {
        logged: null,
        editor: null, // owner of the event or editor through admin agenda
        credential: null // relative to agenda
      }
    } )

    .then( _get( paramName, fieldName, params.inAgendaContext ) )

    .then( _selectLanguage )

    .then( p.ifl( { 'req.agenda' : true }, _loadAgendaContext ) )

    .then( _loadAccessRequired )

    .then( p.ifl( { accessRequired: true }, _loadUserCreds ) )

    .then( p.ifl( { 'req.agenda' : true, accessRequired: true }, _loadUserAgendaCreds ) )

    .done( function( v ) {

      req.event = v.event;

      // event is publicly available
      if ( !v.accessRequired ) {

        return next();

      }

      // event is restricted and user is not logged
      if ( !v.user.logged ) {

        return res.redirect( req.genUrl( req.agenda ? 'agendaSignup' : 'signup', utils.extend( {
          msg: 'limitedAccessEvent',
          redirect: ( new Buffer( req.genUrl( req.agenda ? 'agendaEventShow' : 'eventShow', utils.extend( {
            eventSlug: req.event.slug
          }, req.agenda ? { slug: req.agenda.slug } : {} ) ) ).toString( 'base64' ) )
        }, req.agenda ? {
          slug: req.agenda.slug
        } : {} ) ) );

      }

      // user is logged and is editor or admin or moderator
      if ( v.user.editor || [ 'administrator', 'moderator' ].includes( v.user.credential ) ) {

        return next();

      }

      // user is logged but does not have access
      return next( {
        code: 403,
        messageCode: 'eventRestrictedAccess'
      } );

    }, next );

  }

}

function loadUris( req, res, next ) {

  req.eventUri = req.agenda ? 'agendaEventShow' : 'eventShow';

  req.eventUriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    req.eventUriParams.slug = req.agenda.slug;

  }

  next();

}


function search( limit ) {

  return function( req, res, next ) {

    es.search( req.query.oaq, {
      limit,
      page: req.query.page
    }, function( err, data ) {

      if ( err ) return next( err );

      req.events = data.events;

      req.total = data.total;

      next();

    });

  }

}


function cleanEvents( req, res, next ) {

  svc.exports.cleanEvents( req.events, { includeEmbedded: !!req.query.include_embedded }, ( err, clean ) => {

    if ( err ) return next( err );

    req.formatted = clean;

    next();

  } );

}


function checkEventEditor( req, res, next ) {

  sessions.get( req, { detailed: true }, ( err, user ) => {

    if ( err ) return cb( err );

    if ( !user ) return next( { code: 403 } );

    req.event.isEditor( user.id, ( err, is ) => {

      if ( err || !is ) return next( err || { code: 403 } );

      next();

    } );

  } );

}


function ics( req, res, next ) {

  res.set( 'Content-Type', 'application/json; charset=utf-8' );

  if ( req.query.dl ) {

    res.set( 'Content-disposition', 'attachment; filename=' + req.event.slug + '.ics' );

  }

  res.write( req.event.getIcs( req.agenda, req.lang, true, req.query.timing ) );

  res.end();

}


function layoutData( req, res ) {

  const description = req.formatted.description + ' - ' + req.formatted.dateRange + ' - ' + req.formatted.location.name;

  const data = {
    metas: {
      title: utils.escape( req.formatted.title, false ),
      keywords: utils.escape( req.formatted.keywords, false ),
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: { property: 'og:title', content: utils.escape( req.formatted.title, false ) },
      ogDescription: { property: 'og:description', content: utils.escape( description ) },
      ogLocale: { property: 'og:locale', content: req.lang },
      "twitter:card" : req.event.image ? 'summary_large_image' : 'summary',
      "twitter:title" : utils.escape( req.formatted.title, false ),
      "twitter:description" : utils.escape( description, false ),
      "twitter:domain" : config.domain
    },
    loner: !req.agenda
  };

  const uri = req.agenda ? 'agendaEventShow' : 'eventShow';

  const uriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    uriParams.slug = req.agenda.slug;

    utils.extend( data, {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false )
    });

  }

  if ( !data.headLinks ) data.headLinks = [];
  
  if ( req.event.getLanguages && req.event.getLanguages().length > 1 ) {

    req.event.getLanguages().forEach( function( lang ) {

      data.headLinks.push({
        rel: 'alternate',
        href: req.genUrl( uri, utils.extend( {}, uriParams, { lang } ), { abs: true } ), 
        hreflang: lang 
      });

    });

  }

  data.headLinks.push({
    rel: 'canonical',
    href: req.genUrl( 'eventShow', { eventSlug: req.event.slug }, { abs: true, protocol: 'https://' } )
  });

  if ( req.event.image ) {

    utils.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.event.getImage( true ) },
      "twitter:image" : req.event.getImage( true )
    });

  }

  data.metas.ogUrl = {
    property: 'og:url',
    content: req.genUrl( uri, uriParams, { abs: true } )
  };

  data.scriptParams = {
    uid: req.formatted.uid,
    title: utils.escape( req.formatted.title, false ),
    agendaUid: req.agenda ? req.agenda.uid : false,
    agendaTitle: req.agenda ? req.agenda.title : false,
    ownerUid: req.formatted.owner.uid,
    adminAgendaUids: req.formatted.adminAgendas ? req.formatted.adminAgendas.map( function( a ) { return a.uid; } ) : [],
    hasCustomFields: ( req.formatted.custom && req.formatted.custom.length ) || req.formatted.hasPrivateCustomFields,
    lang: req.lang
  };

  return data;

}


function _loadAgendaContext( v ) {

  return w.promise( function( rs, rj ) {


    v.event.loadAgendaContext( v.req.agenda.id, function( err ) {

      if ( err ) return rj( err );

      rs( v );

    });

  });

}


function _selectLanguage( v ) {

  if ( !v.req.query.lang ) return v;

  if ( v.event.hasLanguage( v.req.query.lang ) ) {

    v.event.switchLanguage( v.req.query.lang );

  }

  return v;

}


function _loadUserAgendaCreds( v ) {

  v.req.log( 'loading user agenda creds' );

  if ( !v.req.user ) {

    v.req.log( 'user is not logged' );

    return v;

  }

  const user = v.req.user;

  return w.promise( function( rs, rj ) {

    return agendaStakeholders( v.req.agenda.id ).get( { userId: user.id }, ( err, member ) => {

      if ( err ) return rj( err );

      if ( !member ) return rs( v );

      v.user.credential = agendaStakeholders.types.codes.get( member.credential );

      return rs( v );

    } );

  } );

}


function _loadUserCreds( v ) {

  v.user.logged = sessions.isLogged( v.req );

  return w.promise( ( rs, rj ) => {

    sessions.isLogged( v.req ).then( is => {

      if ( !is ) return rs( v );

      sessions.get( v.req, ( err, user ) => {

        v.req.user = user;

        v.event.isEditor( v.req.user.id, ( err, is ) => {

          if ( err ) return rj( err );

          v.user.editor = is;

          rs( v );

        });

      } );

    } );


  });

}


/**
 * check whether event access is restricted
 */

function _loadAccessRequired( v ) {

  v.isDraft = v.event.getIsDraft();

  if ( v.req.agenda && v.inAgendaContext ) {

    v.event.isPublishedOn( v.req.agenda );

    v.accessRequired = !v.event.isPublishedOn( v.req.agenda );

  } else {

    v.accessRequired = v.isDraft;

  }

  return v;

}


/**
 * load event instance from request parameters
 */

function _get( paramName, fieldName, inAgendaContext ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return v => {

    return w.promise( function( rs, rj ) {

      const getParams = {};

      getParams[ fieldName ] = v.req.params[ paramName ];

      if ( v.req.agenda && inAgendaContext ) getParams.reviewId = v.req.agenda.id;

      v.req.log( 'getting event with params %s', JSON.stringify( getParams ) );

      svc.get( getParams, ( err, e ) => {

        if ( err ) return rj( err );

        if ( !e ) {

          v.req.log( 'did not find event' );

          return rj( { code: 404 } );

        }

        v.event = e;

        rs( v );

      } );

    });

  }

}