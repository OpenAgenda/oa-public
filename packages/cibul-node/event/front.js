/**
 * search agenda content to public
 */

"use strict";

var appName = 'event/front',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

mw = cmn.loadMiddlewares( 'search' ),

perPage = 20,

routes = {
  agendaEventShow: [ 'get', agendaEventShow, '/:slug/events/:eventSlug' ],
  eventShow: [ 'get', show, '/events/:eventSlug' ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

es = require( 'ES' )( config.es ),

app,

path,

model = cmn.getCibulModel(),

deepExtend = require( 'deep-extend' );


function init( p ) {

  log( 'debug', 'initing' );

  path = p,

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'debug', 'this app has already been loaded' );

    return;

  }

  log( 'debug', 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.set( 'perPage', 20 );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.loadAgenda( 'slug' ),
    _loadEvent,
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( _layoutData )
  ] );

  return exposed;

}


/**
 * controllers
 */

function agendaEventShow( req, res ) {
  
  cmn.render( req, res, 'event/show', { event: req.formattedEvent } );

}

function show( req, res ) {

  cmn.render( req, res, 'event/show', { event: req.formattedEvent } );

}

function _loadEvent( req, res, next ) {

  wn.call( ( req.agenda ? req.agenda.events : model.events() ).get, { slug: req.params.eventSlug } )

  .then( function( data ) {

    if ( !data ) throw { message : 'Whoops. Could not retrieve the event.' };

    req.event = model.events().instance( data ); // here a specific language should be loaded

    req.log.load({ event: req.event.slug });

    return [ req, res ];

  })

  .spread( _selectLanguage )

  .spread( _formatEvent )

  .then( next )

  .catch( function( err ) {

    cmn.errorResponse( req, res, err );

  });

}


/**
 * load requested event language
 */

function _selectLanguage( req, res ) {

  return w.promise( function( resolve, reject ) {

    if ( !req.query.elang ) {

      resolve( [ req, res ] );

      return;

    }

    if ( !req.event.hasLanguage( req.query.elang ) ) {

      cmn.redirect( req, res, req.agenda ? 'agendaEventShow' : 'eventShow', req.agenda ? { slug: req.agenda.slug, eventSlug: req.event.slug } : { eventSlug: req.event.slug } );

      return;

    }

    req.event.switchLanguage( req.query.elang );

    resolve( [ req, res ] );

  });

}

/**
 * prepare event data fitting template requirements
 */

function _formatEvent( req, res ) {

  return w.promise( function( resolve, reject ) {

    async.series([
      req.event.getOwner,
      req.event.getAgendaReferences,
      req.event.getAdminAgendas
    ], function( err, results ) {

      if ( err ) {

        reject( err );

        return;

      }

      var owner, agendaReferences, adminAgendas, location = false;

      req.formattedEvent = {
        uid: req.event.uid,
        slug: req.event.slug,
        title: req.event.getTitle(),
        image: req.event.getImage( false ),
        dateRange: req.event.getDateRange( true ),
        description: req.event.getDescription(),
        freeText: req.event.getFreeText(),
        tags: req.event.getTags(),
        placeName: false,
        address: false,
        latitude: false,
        longitude: false,
        timings: [],
        owner: results[ 0 ],
        agendaReferences: results[ 1 ],
        adminAgendas: results[ 2 ],
        languages: false
      };


      if ( req.event.locations.length ) {

        location = req.event.locations[ 0 ];

        deepExtend( req.formattedEvent, {
          placeName: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          timings: location.timings,
          region: location.region,
          city: location.city,
          postalCode: location.postcode
        } );
        
      }


      if ( req.event.getLanguages().length > 1 ) {

        req.formattedEvent.languages = {
          current: req.event.getCurrentLanguage(),
          selection: req.event.getLanguages()
        };

      }

      resolve();


    });

  });

}


function _layoutData( req, res ) {

  var data = {
    metas: {
      title: req.event.getTitle(),
      ogSiteName: { property: 'og:site_name', content: 'Cibul' },
      ogTitle: { property: 'og:title', content: req.event.getTitle() },
      ogDescription: { property: 'og:description', content: req.event.getDescription() },
      ogLocale: { property: 'og:locale', content: req.lang },
      "twitter:card" : "summary_large_image",
      "twitter:title" : req.event.getTitle(),
      "twitter:description" : req.event.getDescription(),
      "twitter:domain" : config.domain
    },
    loner: !req.agenda
  },

  uri = req.agenda ? 'agendaEventShow' : 'eventShow',

  uriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    uriParams.slug = req.agenda.slug;

    lib.extend( data, {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false ),
      theme: req.agenda.getTheme()
    });

  }

  if ( req.event.getLanguages().length > 1 ) {

    if ( !data.headLinks ) data.headLinks = [];

    req.event.getLanguages().forEach( function( lang ) {

      data.headLinks.push({ rel: 'alternate', href: req.genUrl( uri, lib.extend( { elang: lang }, uriParams ), { abs: true } ), hreflang: lang });

    });

  }

  if ( req.event.image ) {

    lib.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.event.getImage( true ) },
      "twitter:image:src" : req.event.getImage( true )
    });

  }

  data.metas.ogUrl = {
    property: 'og:url',
    content: req.genUrl( uri, uriParams, { abs: true } )
  };

  data.scriptParams = {
    ownerUid: req.formattedEvent.owner.uid,
    adminAgendaUids: req.formattedEvent.adminAgendas ? req.formattedEvent.adminAgendas.map( function( a ) { return a.uid; } ) : []
  };

  return data;

}


module.exports = init;