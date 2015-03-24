var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

path,

routes = {

  agendaEventShow: [ 'get', '/:slug/events/:eventSlug', [
    cmn.loadAgenda( 'slug' ), 
    _loadEvent( 'eventSlug', 'slug' ), 
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    agendaEventShow
  ] ],

  agendaEmbedEventShow: [ 'get', '/agendas/:uid/embed/events/:eventUid', [
    cmn.loadAgenda( 'uid' ),
    _loadEvent( 'eventUid', 'uid' ),
    cmn.loadBaseData( _layoutData, 'embedDefault.css' ),
    agendaEmbedEventShow
  ] ],

  agendaCustomEmbedEventShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events/:eventUid', [
    cmn.loadAgenda( 'uid' ),
    _loadEvent( 'eventUid', 'uid' ),
    cmn.loadBaseData( _layoutData, 'embedDefault.css' ),
    agendaCustomEmbedEventShow 
  ] ],

  eventShow: [ 'get', '/events/:eventSlug', [ 
    _loadEvent( 'eventSlug', 'slug' ), 
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    show
  ] ],
  
  eventActionShow: [ 'get', '/events/:eventSlug/action', [
    _loadEvent( 'eventSlug', 'slug' ),
    _loadUris,
    _extractAgendasSharing,
    _conditionalLayout( _layoutData, 'oa.css' ),
    actionShow
  ] ],
  
  eventActionDatesShow: [ 'get', '/events/:eventSlug/action/dates', [
    _loadEvent( 'eventSlug', 'slug' ),
    _loadUris,
    _conditionalLayout( _layoutData, 'oa.css' ),
    actionDatesShow
  ] ]

},

log = require( '../lib/logger' )( 'event front' ),

async = require( 'async' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

es = require( 'ES' )( config.es ),

shareSvc = require( '../services/event/share' ),

model = cmn.getCibulModel(),

deepExtend = require( 'deep-extend' );

module.exports = function( p ) {

  path = p;

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


/**
 * controllers
 */

function agendaEventShow( req, res ) {

  _addLanguageLinks( req, 'agendaEventShow', {
    slug: req.params.slug,
    eventSlug: req.params.eventSlug
  } );
  
  cmn.render( req, res, 'event/new', { event: req.formattedEvent } );

}


function agendaEmbedEventShow( req, res ) {

  _addLanguageLinks( req, 'agendaEmbedEventShow', { 
    uid: req.params.uid,
    eventUid: req.params.eventUid
  } );

  cmn.render( req, res, 'event/embedShow', {
    event: req.formattedEvent,
    backUri: 'embedShow',
    backQuery: { uid: req.params.uid }
  } );

}


function agendaCustomEmbedEventShow( req, res ) {

  _addLanguageLinks( req, 'agendaCustomEmbedEventShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    eventUid: req.params.eventUid
  } );

  cmn.render( req, res, 'event/embedShow', { 
    event: req.formattedEvent, 
    backUri: 'customEmbedShow',
    backQuery: { uid: req.params.uid, embedUid: req.params.embedUid }
  } );

}


function show( req, res ) {

  _addLanguageLinks( req, 'eventShow', {
    eventSlug: req.params.eventSlug
  } );

  cmn.render( req, res, 'event/new', { event: req.formattedEvent } );

}


function actionShow( req, res ) {

  var templateData = {
    event: {
      uid: req.event.uid,
      title: req.event.getTitle(),
      imports: []
    },
    logged: req.session.logged,
    agendas: []
  },

  timings = req.event.getTimings(),

  multipleTimings = timings.length > 1;

  shareSvc.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  templateData.event.imports = [
    { 
      label: 'Google Calendar',
      uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'google' } ] ) : timings[ 0 ].calendarLinks.google,

    },
    { 
      label: 'Yahoo! Calendar',
      uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'yahoo' } ] ) : timings[ 0 ].calendarLinks.yahoo,
    },
    { 
      label: 'Windows Live',
      uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'live' } ] ) : timings[ 0 ].calendarLinks.live
    }
  ];

  templateData.event.multipleTimings = multipleTimings;

  if ( !req.session.logged ) return cmn.render( req, res, 'event/action', templateData );

  model.reviews().list( { stakeholderId: req.user.id }, function( err, agendas ) {

    if ( err ) return cmn.catchError( req, res )( err );

    templateData.agendas = agendas.map( function( a ) {

      return {
        uid: a.uid,
        slug: a.slug,
        title: a.title,
        sharing: req.agendasSharing.indexOf( a.id ) !== -1
      };

    });

    return cmn.render( req, res, 'event/action', templateData );

  } );

}


function actionDatesShow( req, res ) {

  var service = [ 'google', 'yahoo', 'live' ].indexOf( req.query.service ) !== -1 ? req.query.service : 'google';

  shareSvc.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  return cmn.render( req, res, 'event/actionDates', {
    event: {
      timings: req.event.locations[0].timings.map( function( timing ) {

        return {
          date: timing.date,
          start: timing.start,
          link: timing.calendarLinks[ service ]
        }

      })
    }
  });

}


function _addLanguageLinks( req, uri, uriParams ) {

  var linkedLanguages = [];

  if ( !req.formattedEvent.languages ) return;

  req.formattedEvent.languages.selection.forEach( function( lang ) {

    linkedLanguages.push({
      label: lang,
      link: req.genUrl( uri, lib.extend( {}, uriParams, { elang: lang } ) )
    });

  });

  req.formattedEvent.languages.selection = linkedLanguages;

}


function _loadEvent( queryParam, fieldName ) {

  return function( req, res, next ) {

    var eventGetParams = {};

    eventGetParams[ fieldName ] = req.params[ queryParam ];

    wn.call( ( req.agenda ? req.agenda.events : model.events() ).get, eventGetParams )

    .then( function( data ) {

      if ( !data ) throw { code: 404 };

      req.event = model.events().instance( data ); // here a specific language should be loaded

      req.log.load({ event: req.event.slug });

      return [ req, res ];

    })

    .spread( _selectLanguage )

    .spread( _formatEvent )

    .then( next )

    .catch( cmn.catchError( req, res ) );

  }

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
        isUpcoming: req.event.isUpcoming(),
        description: req.event.getDescription(),
        freeText: req.event.getEnrichedFreeText(),
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
          postalCode: location.postcode,
          ticketLink: false
        } );

        if ( location.ticketLink ) {

          req.formattedEvent.ticketLink = location.ticketLink;

        }

        if ( location.pricingInfo ) {

          req.formattedEvent.pricingInfo = location.pricingInfo[ req.event.getCurrentLanguage() ];
          
        }
        
      }


      if ( req.event.getLanguages().length > 1 ) {

        req.formattedEvent.languages = {
          current: req.event.getCurrentLanguage(),
          selection: req.event.getLanguages()
        };

      }


      req.formattedEvent.importUri = req.genUrl( 'eventActionShow', { eventSlug: req.event.slug } );

      resolve();


    });

  });

}


function _conditionalLayout( func, css ) {

  return function( req, res, next ) {

    if ( req.xhr ) return next();

    cmn.loadBaseData( func, css )( req, res, next );

  }

} 


function _loadUris( req, res, next ) {

  req.eventUri = req.agenda ? 'agendaEventShow' : 'eventShow';

  req.eventUriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    req.eventUriParams.slug = req.agenda.slug;

  }

  next();

}


/**
 * load agendas sharing the event
 */
function _extractAgendasSharing( req, res, next ) {

  req.agendasSharing = req.event.articles.filter( function( a ) {

    return a.isPublished;

  } ).map( function( a ) {

    return a.review.id;

  });

  next();

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