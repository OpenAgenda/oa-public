"use strict";

var svc,

p = require( '../../../lib/promises' ), w = p.w,

log = require( 'logger' )( 'event middleware' ),

utils = require( 'utils' ),

async = require( 'async' ),

config = require( '../../../config' ),

i18n = require( '../../../i18n/i18n' );

module.exports = function( eventService ) {

  svc = eventService;

  return {
    load: loadEvent,
    loadUris: loadUris,
    format: require( './format' ),
    components: require( './components' ),
    cleanEvents: cleanEvents,
    search: search,
    checkEventEditor: checkEventEditor,
    layoutData: layoutData
  }

}


/**
 * load event instance and set it in req.event
 */

function loadEvent( paramName, fieldName, options ) {

  var params = utils.extend( { 
    inAgendaContext: true // if agenda is in request and event must not be loaded in agenda context, use this
  }, options || {} );

  return function( req, res, next ) {

    w( {
      req: req,
      res: res,
      event: false
    } )

    .then( _get( paramName, fieldName, params.inAgendaContext ) )

    .then( _selectLanguage )

    .then( _loadAccessRequired )

    .then( p.ifl( { 'req.agenda' : true }, _loadAgendaContext ) )

    .then( p.ifl( { accessRequired: true }, _loadUserCreds ) )

    .then( p.ifl( { 'req.agenda' : true, accessRequired: true }, _loadUserAgendaCreds ) )

    .then( p.ifl( { 'req.agenda' : true, accessRequired: true, hasAgendaCreds: false }, _redirectToCanonicalIfNotDraft ) )

    .done( function( v ) {

      if ( v.redirect ) {

        log( 'redirecting to %s with code %s', v.redirect.to, v.redirect.code );

        return res.redirect( v.redirect.code, v.redirect.to );

      }

      req.event = v.event;

      if ( v.accessRequired ) {

        if ( !req.session.logged ) return next( { code: 401 } );

        if ( params.inAgendaContext && req.agenda && !v.hasAgendaCreds ){

          req.log( 'user does not have required agenda credentials' );

          return next( { code: 403 } );

        }

        if ( v.isDraft && !v.hasCreds ) {

          req.log( 'user does not have required credentials' );

          return next( { code: 403 } );

        }

      }

      next();

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
      limit: limit,
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

  svc.exports.cleanEvents( req.events, function( err, clean ) {

    if ( err ) return next( err );

    req.formatted = clean;

    next();

  } );

}


function checkEventEditor( req, res, next ) {

  req.event.isEditor( req.session.userId, function( err, is ) {

    if ( err || !is ) return next( err || { code: 403 } );

    next();

  } );

}


function layoutData( req, res ) {

  var data = {
    metas: {
      title: utils.escape( req.formatted.title, false ),
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: { property: 'og:title', content: utils.escape( req.formatted.title, false ) },
      ogDescription: { property: 'og:description', content: utils.escape( req.formatted.description ) },
      ogLocale: { property: 'og:locale', content: req.lang },
      "twitter:card" : "summary_large_image",
      "twitter:title" : utils.escape( req.formatted.title, false ),
      "twitter:description" : utils.escape( req.formatted.description, false ),
      "twitter:domain" : config.domain
    },
    loner: !req.agenda
  },

  uri = req.agenda ? 'agendaEventShow' : 'eventShow',

  uriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    uriParams.slug = req.agenda.slug;

    utils.extend( data, {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false ),
      theme: req.agenda.getTheme()
    });

  }

  if ( !data.headLinks ) data.headLinks = [];
  
  if ( req.event.getLanguages && req.event.getLanguages().length > 1 ) {

    req.event.getLanguages().forEach( function( lang ) {

      data.headLinks.push({
        rel: 'alternate',
        href: req.genUrl( uri, utils.extend( {}, uriParams, { lang: lang } ), { abs: true } ), 
        hreflang: lang 
      });

    });

  }

  data.headLinks.push({
    rel: 'canonical',
    href: req.genUrl( 'eventShow', { eventSlug: req.event.slug }, { abs: true, protocol: 'https://' } )
  });

  if ( req.event.image ) {

    utils.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.event.image},
      "twitter:image:src" : req.event.image
    });

  }

  data.metas.ogUrl = {
    property: 'og:url',
    content: req.genUrl( uri, uriParams, { abs: true } )
  };

  data.scriptParams = {
    uid: req.formatted.uid,
    agendaUid: req.agenda ? req.agenda.uid : false,
    ownerUid: req.formatted.owner.uid,
    adminAgendaUids: req.formatted.adminAgendas ? req.formatted.adminAgendas.map( function( a ) { return a.uid; } ) : [],
    hasCustomFields: req.formatted.custom && req.formatted.custom.length,
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


function _redirectToCanonicalIfNotDraft( v ) {

  if ( !v.event.getIsDraft() ) {

    v.redirect = {
      code: 302,
      to: v.req.genUrl( 'eventShow', { eventSlug: v.event.slug } )
    };

  }

  return v;

}


function _selectLanguage( v ) {

  if ( !v.req.query.lang ) return v;

  if ( v.event.hasLanguage( v.req.query.lang ) ) {

    v.event.switchLanguage( v.req.query.lang );

  }

  return v;

}


function _loadOwnershipCreds( v ) {

  if ( !v.req.session.logged ) return v;

  if ( v.event.ownerId == v.req.session.userId ) {

    log( 'user is owner' );

    v.hasCreds = true;

  }

  return v;

}


function _loadUserAgendaCreds( v ) {

  v.req.log( 'loading user agenda creds' );

  if ( !v.req.session.logged ) {

    v.req.log( 'user is not logged' );

    return v;

  }

  var user = { id: v.req.session.userId };

  return w.promise( function( rs, rj ) {

    v.req.agenda.isAdministrator( user , function( err, is ) {

      v.req.log( 'user %s administrator', is ? 'is' : 'is not' );

      if ( err ) return rj( err );

      if ( is ) {

        v.hasAgendaCreds = true;

        return rs( v );

      };

      v.req.agenda.isModerator( user, function( err, is ) {

        if ( err ) return rj( err );

        if ( is ) {

          v.hasAgendaCreds = true;

          return rs( v );

        }

        v.req.agenda.isContributor( user, function( err, is ) {

          v.hasAgendaCreds = v.hasCreds && is;

          rs( v );

        } );

      });

    } )

  });

}


function _loadUserCreds( v ) {

  v.req.log( 'checking user creds' );

  if ( !v.req.session.logged ) {

    v.req.log( 'user is not logged' );

    return v;

  }

  return w.promise( function( rs, rj ) {

    // I just need to be able to see it if it is not draft.
    // if it is draft

    v.event.isEditor( v.req.session.userId, function( err, is ) {

      v.req.log( 'user is editor' );

      if ( err ) return rj( err );

      if ( is ) v.hasCreds = true;

      rs( v );

    });

  });

}


/**
 * check whether event access is restricted
 */

function _loadAccessRequired( v ) {

  v.isDraft = v.event.getIsDraft();

  v.accessRequired = ( v.req.agenda && !v.event.isPublishedOn( v.req.agenda ) ) || v.isDraft;

  return v;

}


/**
 * load event instance from request parameters
 */

function _get( paramName, fieldName, inAgendaContext ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( v ) {

    return w.promise( function( rs, rj ) {

      var getParams = {};

      getParams[ fieldName ] = v.req.params[ paramName ];

      if ( v.req.agenda && inAgendaContext ) getParams.reviewId = v.req.agenda.id;

      v.req.log( 'getting event with params %s', JSON.stringify( getParams ) );

      svc.get( getParams, function( err, e ) {

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