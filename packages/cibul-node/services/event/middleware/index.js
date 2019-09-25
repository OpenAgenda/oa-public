"use strict";

const _ = require( 'lodash' );

const sessions = require( '@openagenda/sessions' );
const utils = require( '@openagenda/utils' );
const es = require('../../elasticsearch');
const membersSvc = require('../../members');
const config = require( '../../../config' );
const p = require( '../../../lib/promises' );
const w = p.w;
const { getRoleSlug } = membersSvc.utils;

let svc;

module.exports = function( eventService ) {

  svc = eventService;

  return {
    load: loadEvent,
    format: require( './format' ),
    components: require( './components' ),
    cleanEvents,
    search,
    layoutData
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

    .done( async v => {

      req.event = v.event;

      // event is publicly available
      if ( !v.accessRequired ) {

        return next();

      }

      // event is restricted and user is not logged
      if ( !await v.user.logged ) {

        const redirect = Buffer.from(req.originalUrl).toString( 'base64' );

        return res.redirect( `${req.agenda?'/'+req.agenda.slug:''}/signin?msg=limitedAccessEvent&redirect=${redirect}` );

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
    content: `${config.root}${req.agenda ? `/agendas/${req.agenda.uid}` : ''}/events/${req.event.uid}?lang=${req.lang}`
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


async function _loadUserAgendaCreds( v ) {

  v.req.log( 'loading user agenda creds' );

  if ( !v.req.user ) {

    v.req.log( 'user is not logged' );

    return v;

  }

  const user = v.req.user;

  const member = await membersSvc.get({
    agendaUid: v.req.agenda.uid,
    userUid: user.uid
  });

  if (member) {
    v.user.credential = getRoleSlug(member.role);
  }

  return v;

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
