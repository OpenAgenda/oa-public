"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const ih = require('immutability-helper');
const { produce } = require('immer');
const qs = require( 'qs' );
const base64 = require('@openagenda/utils/base64');

const agendas = require( '@openagenda/agendas' );
const agendaSvc = require( '../services/agenda' );
const controlDataSvc = require( '../services/legacy' ).controlData;
const fb = require( '@openagenda/facebook' );
const getEventLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/event/show' ) );
const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/show' ) );
const sessions = require( '../services/sessions' );
const registration = require( '@openagenda/registration/src/validate' ).getTypesAndValues;
const slugs = require( '@openagenda/slugs' );
const forbiddenLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/forbidden' ) );
const utils = require( '@openagenda/utils' );

const cacheMw = require( '../lib/cache.mw' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const embedSvc = require( '../services/embed' );
const members = require( '../services/members' );
const eventFormat = require( '../services/event/middleware/format' );
const pickEventImage = require( '../services/event/lib/pickImage' );
const legacyEventSvc = require( '../services/event' );
const getLongDescriptionHTML = require('../services/event/lib/getLongDescriptionHTML');
const lib = require( '../lib/lib' );

const perPage = 20;

const preMw = [
  cmn.loadLogger( 'agenda front' )
];

const middlewares = {
  show: [
    agendaSvc.mw.search(perPage),
    _format,
    _formatShowLinks,
    showXhr('agenda/show'),
    cmn.loadBaseData(_layoutData, 'oa-main.css'),
    _loadAgendaLanguages,
    show,
  ],
  embedShow: [
    _optionalClearCookie,
    _loadTagGroups,
    _format,
    _formatEmbedHeadLinks,
    _formatCustomEmbedLinks,
    embedSvc.mw.renderEventItems,
    embedSvc.mw.renderHeader,
    showXhr('agenda/embedShow'),
    cmn.useEmbedGoogleAnalytics,
    cmn.loadBaseData(_layoutData),
    embedSvc.mw.loadCustomLayoutData,
    renderEmbedShow,
  ],
};


module.exports = app => {
  app.options( '*/controldata*', ( req, res ) => res.sendStatus(200) );

  app.get(
    '/agendas/:uid/embeds/:embedUid/controldata',
    preMw,
    agendaSvc.mw.load( 'uid', { basicLoad: true, cache: true } ),
    cmn.ifIs( 'agenda.private', ( req, res, next ) => { next( { code: 403 } ) } ),
    controlDataSvc.embedMiddleware,
    controlDataSvc.middleware
  );

  app.get(
    '/agendas/:uid/controldata',
    preMw,
    agendaSvc.mw.load( 'uid', { basicLoad: true, cache: true } ),
    cmn.ifIs( 'agenda.private', ( req, res, next ) => { next( { code: 403 } ) } ),
    controlDataSvc.middleware
  );

  app.get(
    '/agendas/:uid/controldata.prv',
    preMw,
    agendaSvc.mw.load( 'uid', { basicLoad: true, cache: true } ),
    cmn.ifIsNot( 'agenda.private', cmn.redirectTo( 'controlData', { uid: 'uid' } ) ),
    members.mw.loadAndAuthorize('reader'),
    controlDataSvc.middleware
  );

  app.post(
    '/facebook/tab',
    preMw,
    cmn.redirectLegacySearch,
    cmn.useEmbedGoogleAnalytics,
    fb.tab.loadAgendaId,
    _loadAgendaByAgendaId,
    cmn.ifIs( 'agenda.private', ( req, res, next ) => { next( { code: 403 } ) } ),
    _redirectToEmbed
  );

  app.get(
    '/agendas/:uid/embed/events',
    preMw,
    cmn.redirectLegacySearch,
    agendaSvc.mw.load( 'uid', { cache: true } ),
    cmn.ifIs( 'agenda.private', ( req, res, next ) => { next( { code: 403 } ) } ),
    agendaSvc.mw.browserCache,
    agendaSvc.mw.search( perPage ),
    _format,
    _appendFacebookParams,
    _formatEmbedHeadLinks,
    _formatEmbedLinks,
    embedSvc.mw.renderEventItems,
    embedSvc.mw.renderHeader,
    showXhr( 'agenda/embedShow' ),
    cmn.useEmbedGoogleAnalytics,
    cmn.loadBaseData( _layoutData, 'oae.css' ),  // this needs to switch to embed base css ( can be deactivated )
    renderEmbedShow,
    ( req, res ) => res.send( req.render )
  );

  app.get(
    '/agendas/:uid/embeds/:embedUid/events',
    preMw,
    cacheMw( 'customEmbedShow', 'params.embedUid', 30, [
      cmn.redirectLegacySearch,
      agendaSvc.mw.load( 'uid', { cache: true } ),
      //useless if cache is used cmn.ifIs( 'agenda.private', ( req, res, next ) => { next( { code: 403 } ) } ),
      embedSvc.mw.load( 'embedUid', 'uid' ),
      embedSvc.mw.browserCache,
      agendaSvc.mw.search( perPage ),
      middlewares.embedShow
    ] )
  );

  app.get(
    '/agendas/:uid/previewEmbeds/:embedUid/events',
    preMw,
    cmn.redirectLegacySearch,
    ( req, res, next ) => {
      req.preview = true;
      next()
    },
    agendaSvc.mw.load( 'uid', { cache: true } ),
    members.mw.loadAndAuthorize('administrator'),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    agendaSvc.mw.search( perPage, true ),
    middlewares.embedShow,
    ( req, res ) => res.send( req.render )
  );

  app.get(
    '/agendas/:uid',
    preMw,
    cmn.redirectLegacySearch,
    agendas.middleware.load( {
      private: null,
      namespaces: { identifiers: { uid: 'params.uid' } }
    } ),
    _showJSONIfRequested,
    redirect
  );

  app.get('/agendas/:uid/contribute',
    agendas.middleware.load({
      private: null,
      namespaces: { identifiers: { uid: 'params.uid' } }
    }),
    (req, res, next) => {
      if (!req.agenda) {
        return next();
      }
      res.redirect(301, `/${req.agenda.slug}/contribute`);
    }
  );

  app.get(
    '/:slug.prv',
    preMw,
    cmn.https,
    cmn.redirectLegacySearch,
    agendaSvc.mw.load( 'slug', { cache: true } ),
    ( req, res, next ) => {
      if ( !req.agenda.private ) {
        return res.redirect( 302, `/${req.agenda.slug}` );
      }
      next();
    },
    sessions.mw.loadOrRedirect(),
    members.mw.load,
    ( req, res, next ) => {
      if ( !req.member ) return cmn.renderUnauthorized( req, res, next );
      next();
    },
    _showJSONIfRequested,
    middlewares.show
  );

  app.get(
    '/:slug',
    preMw,
    cmn.https,
    cmn.redirectLegacySearch,
    agendaSvc.mw.load( 'slug', { cache: true } ),
    ( req, res, next ) => {
      if ( req.agenda.private ) {
        return res.redirect( 302, `/${req.agenda.slug}.prv` );
      }
      next();
    },
    _showJSONIfRequested,
    agendaSvc.mw.browserCache,
    middlewares.show
  );

  app.get(
    '/:slug/unauthorized',
    preMw,
    cmn.loadBaseData( 'oa-main.css' ),
    agendaSvc.mw.load( 'slug', { cache: true } ),
    unauthorizedIP
  );

  app.get(
    '/:slug/addevent',
    (req, res) => {
      res.redirect(301, `/${req.params.slug}/contribute`);
    }
  );

  app.get(
    '/:slug/actions',
    (req, res) => {
      res.redirect(`/${req.params.slug}?sharemodal=1`);
    }
  );
};





/**
 * Requested by Education Nationale for RGPD compliance
 */
function _optionalClearCookie( req, res, next ) {

  if ( !_.get( req, 'query.disableCookies' ) ) return next();

  for ( const name in req.cookies ) {

    if ( req.cookies.hasOwnProperty( name ) ) {

      res.cookie( name, '', { expires: new Date( 0 ) } );

    }

  }

  next();

}


function _loadTagGroups( req, res, next ) {

  const {
    legacy: {
      getTagSet
    }
  } = req.app.services;

  if ( !req.agenda ) return next();

  getTagSet(req.agenda.id).then(tagSet => {
    req.agenda.tagSet = tagSet;
    next();
  }, next);

}

/**
 * controllers
 */


function showXhr( template ) {

  return function ( req, res, next ) {

    if ( !req.xhr ) return next();

    lib.extend( req.templateData, {
      agenda: {
        slug: req.agenda.slug
      }
    } );

    if ( req.renders ) req.templateData.renders = req.renders;

    cmn.renderTemplate( req, template, req.templateData, function( err, partial ) {

      cmn.renderJson( req, res, {
        success: true,
        partial,
        total: req.templateData.total,
        page: req.templateData.page
      } );

    });

  }

}

function _showJSONIfRequested(req, res, next) {
  if (req.accepts(['html', 'json'])==='json') {
    return res.json({
      ..._.pick(req.agenda, [
        'uid', 'title', 'description', 'slug', 'url', 'official'
      ]),
      image: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : null
    });
  }
  next();
}

function show(req, res) {
  agendas.get({
    uid: req.agenda.uid
  }, { private: null, internal: true }, (err, agenda) => {
    req.templateData = produce(req.templateData, draft => {
      draft.tiles = config.tiles;

      draft.agenda = {
        uid: req.agenda.uid,
        slug: req.agenda.slug,
        title: req.agenda.title,
        description: req.agenda.description,
        url: req.agenda.url,
        private: req.agenda.private,
        image: req.agenda.getImage(false),
        official: req.agenda.official,
        isEmpty: req.agenda.isEmpty,
        importUri: req.genUrl('agendaActionShow', { slug: req.agenda.slug }),
      };

      draft.mailto = cmn.agendaMailTo(agenda);
    });

    req.baseData.indexed = (agenda?.indexed ?? true) && !(agenda?.private ?? false);

    req.baseData.scriptParams.googleAnalyticsID = agenda?.settings?.tracking?.googleAnalytics;

    cmn.render(req, res, 'agenda/show', req.templateData);
  });
}


function redirect( req, res, next ) {

  if ( !req.agenda ) {

    return next( { code: 404 } );

  }

  const redirect = req.genUrl( 'agendaShow', { slug: req.agenda.slug, oaq: req.query.oaq }, { protocol: 'https://' } );

  req.log( 'info', 'redirecting to %s', redirect );

  return res.redirect( 302, redirect );

}


function renderEmbedShow( req, res, next ) {

  agendas.get( {
    uid: req.agenda.uid
  }, {
    private: null,
    internal: true
  }, ( err, agenda ) => {

    cmn.renderTemplate( req, 'agenda/embedShow', ih( req.templateData, {
      agenda: {
        $set: {
          uid: req.agenda.uid + ( req.embed ? '/' + req.embed.uid : '' ),
          isEmpty: req.agenda.isEmpty,
        }
      },
      googleAnalytics: {
        $set: _.get( agenda, 'settings.tracking.googleAnalytics' )
      },
      renders: {
        $set: req.renders
      },
      pager: {
        $set: {
          base: { uid: req.agenda.uid },
          routeName: 'agendaEmbedShow',
          current: req.templateData.page,
          total: req.total,
          perPage
        }
      }
    } ), false, ( err, render ) => {

      if ( err ) return next( err );

      req.render = render;
      res.data = render;

      next();

    } );

  } );

}




/**
 * format data to template requirements
 */

function _format( req, res, next ) {

  async.map( req.events, function( e, mcb ) {

    _formatEventItem( e, req, mcb );

  }, function( err, formattedEvents ) {

    if ( err ) return cb( err );

    const passedQuery = JSON.parse( JSON.stringify( req.query ) );

    if ( !passedQuery.oaq ) {

      passedQuery.oaq = {};

    }

    passedQuery.oaq.passed = 1;

    req.templateData = {
      events: formattedEvents,
      hasSearchQuery: !!lib.size( req.query.oaq ),
      // are all events of the agenda passed
      passed: req.agenda.passed,
      // does the current selection include passed events
      passedIncluded: req.query.oaq ? req.query.oaq.passed : false,
      passedQuery,
      total: req.total,
      page: req.query.page || 1
    };

    req.events = formattedEvents;

    next();

  } );

}

function _appendFacebookParams( req, res, next ) {

  if ( !req.query.fb ) return next();

  req.templateData.fb = true;

  req.templateData.scriptParams = {
    facebook: true,
    fbAppId: config.auth.facebook.id
  }

  next();

}

function _redirectToEmbed( req, res, next ) {

  res.redirect( 303, req.genUrl( 'agendaEmbedShow', { uid: req.agenda.uid, fb: 1 } ) );

}

function _loadAgendaByAgendaId( req, res, next ) {

  if ( !req.agendaId ) return next( new Error(  'agenda identifier missing' ) );

  agendaSvc.get( { id: req.agendaId }, function( err, agenda ) {

    if ( err ) return next( err );

    if ( !agenda ) return next( { code: 404 } );

    req.agenda = agenda;

    next();

  });

}


function _formatEventItem( event, req, cb ) {

  const inst = legacyEventSvc.instanciate( event ),

  img = inst.getImage( true ),

  keywords = inst.getTags(),

  organization = event.organization ? { slug: event.organizationSlug, label: event.organization } : false;

  inst.switchLanguage( req.lang );

  const longDescriptionLinks = inst.getLinks();

  const formatted = lib.extend( inst, {
    dateRange: inst.getRange( req.lang, req.query.oaq ),
    closestDate: inst.getClosestDate(),
    keywords,
    keywordList: eventFormat.listifyKeywords( keywords ),
    tags: [],
    title: inst.getTitle(),
    image: img ? img/*.replace( 'cibuldev', 'cibul' )*/ : false,
    thumbnail: pickEventImage( config, inst, 'thumbnail' ),
    description: inst.getDescription(),
    freeText: getLongDescriptionHTML({
      lang: req.lang,
      services: req.app.services
    }, inst.getFreeText(), longDescriptionLinks),
    longDescriptionLinks,
    placeName: inst.getLocationName(),
    address: inst.getAddress()?.label,
    placeNameLabel: inst.getLocationName()?.label,
    city: inst.getCity()?.label,
    pricingInfo: inst.getPricingInfo(),
    ticketLink: inst.getTicketLink(),
    registration: registration( inst.getTicketLink( true ) ),
    ticketLabel: getEventLabel( 'ticketingLink', req.lang ),
    interfaceLang: req.lang,
    actionLink: req.genUrl( 'agendaEventActionShow', {
      slug: req.agenda.slug,
      eventSlug: event.slug
    }, { protocol: 'https://' } ),
    actionLabel: getLabel( 'export', req.lang ),
    organization,
    contributor: {
      organization: organization ? organization.label : null
    },
    category: false,
    favorite: cmn.favoriteLinkHTML( inst.uid ),
    location: _.mapValues( _.first( inst.locations ), value => _.isObject( value ) ? _.get( value, req.lang ) : value )
  } );

  inst.getAgendaCategory( function( err, c ) {

    if ( err ) return cb( err, formatted );

    if ( c ) {

      formatted.category = c.label;

      formatted.categorySlug = c.slug;

    }

    inst.getAgendaTags( function( err, t ) {

      formatted.tags = t;

      if ( req.agenda.tagSet ) formatted.tagGroups = req.agenda.tagSet.groups.map( g => ( {
        name: g.name,
        slug: g.name ? slugs.generate( g.name ) : null,
        tags: g.tags.filter( t => formatted.tags.map( t => t.slug ).includes( t.slug ) )
      } ) ).filter( g => g.tags.length );

      return cb( null, formatted );

    } );

  } );

}


function _formatShowLinks( req, res, next ) {

  req.templateData.events.forEach(  e => {

    const params = {
      lang : req.lang
    };

    if ( req.query.oaq ) params.search = req.query.oaq;

    e.link = `/${req.agenda.slug}/events/${e.slug}${qs.stringify(params, { addQueryPrefix: true })}`;

    /*e.importUri = req.genUrl('agendaEventActionShow', {
      slug: req.agenda.slug,
      eventSlug: e.slug,
      redirect:
    });*/

    e.importUri = `/${req.agenda.slug}/events/${e.slug}/action?redirect=${base64.encode(`/${req.agenda.slug}` + qs.stringify(req.query, { addQueryPrefix: true }))}`

  });

  next();

}


function _formatEmbedHeadLinks( req, res, next ) {

  req.actionLink = {
    url: req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } ),
    label: getLabel( 'export', req.lang )
  };

  req.actionLabel = getLabel( 'export', req.lang );

  next();

}


function _formatEmbedLinks( req, res, next ) {

  req.templateData.events.forEach( e => {

    const params = { lang: req.lang };

    if ( req.query.fb ) params.fb = 1;

    if ( req.query.oaq ) params.search = req.query.oaq;

    e.link = `/agendas/${req.agenda.uid}/embed/events/${e.uid}${qs.stringify( params, { addQueryPrefix: true } )}`;

    e.oaLink = '//openagenda.com/agendas/' + req.agenda.uid + '/events/' + e.uid;

    if ( e.categorySlug ) {

      e.categoryLink = req.genUrl( 'agendaEmbedShow', {
        uid: req.params.uid,
        oaq: {
          category: e.categorySlug
        }
      } );

    }

    if ( e.tags ) e.tags.forEach( t => {

      t.link = req.genUrl( 'agendaEmbedShow', {
        uid: req.params.uid,
        oaq: {
          tags: [ t.slug ]
        }
      } );

    } );

    if ( e.tagGroups ) e.tagGroups.forEach( tg => {

      tg.tags.forEach( t => {

        t.link = req.genUrl( 'agendaEmbedShow', {
          uid: req.params.uid,
          oaq: {
            tags: [ t.slug ]
          }
        } );

      } );

    } );

  } );

  next();

}


function _formatCustomEmbedLinks( req, res, next ) {

  req.templateData.events.forEach( e => {

    const params = {
      lang: req.lang
    };

    if ( req.query.oaq ) params.search = req.query.oaq;

    e.link = (req.preview
      ? `/agendas/${req.agenda.uid}/previewEmbeds/${req.embed.uid}/events/${e.uid}`
      : `/agendas/${req.agenda.uid}/embeds/${req.embed.uid}/events/${e.uid}`)
    + qs.stringify( params, { addQueryPrefix: true } );

    e.oaLink = '//openagenda.com/agendas/' + req.agenda.uid + '/events/' + e.uid;

    if ( e.categorySlug ) {

      e.categoryLink = req.genUrl( req.preview ? 'customEmbedShowPreview' : 'customEmbedShow', {
        uid: req.params.uid,
        embedUid: req.embed.uid,
        oaq: {
          category: e.categorySlug,
          passed: req.query.passed
        },
        lang: req.lang
      } );

    }

    if ( e.tags ) e.tags.forEach( t => {

      t.link = req.genUrl( req.preview ? 'customEmbedShowPreview' : 'customEmbedShow', {
        uid: req.params.uid,
        embedUid: req.embed.uid,
        oaq: {
          tags: [ t.slug ],
          passed: req.query.passed
        },
        lang: req.lang
      } );

    } );

    if ( e.tagGroups ) e.tagGroups.forEach( tg => {

      tg.tags.forEach( t => {

        t.link = req.genUrl( 'agendaEmbedShow', {
          uid: req.params.uid,
          oaq: {
            tags: [ t.slug ]
          }
        } );

      } );

    } );

  } );

  next();

}


function _loadAgendaLanguages(req, res, next) {
  req.agenda.getLanguages((err, languages) => {
    req.baseData.scriptParams['languages'] = languages;

    next();
  });
}

function _layoutData( req, res ) {

  req.log( 'loading layout data' );

  const url = `${config.root}/${req.agenda.slug}`;

  const data = {
    agenda: {
      theme: req.agenda.getTheme(),
    },
    queryLang: req.query.lang ? req.query.lang : false,
    scriptParams: {
      apiRoot: config.apiRoot,
      root: config.root,
      total: req.total,
      perPage,
      uid: req.agenda.uid + ( req.embed ? '/' + req.embed.uid : '' ),
      lang: req.lang,
      title: req.agenda.title,
      slug: req.agenda.slug,
      res: {
        share: url + '?sharemodal=1',
        actions: url + '/actions'
      }
    },
    metas: {
      title: utils.escape( req.agenda.title, false ),
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: { property: 'og:title', content: utils.escape( req.agenda.title, false ) },
      ogType: { property: 'og:type', content: 'activity' },
      ogLanguage: { property: 'og:language', content: req.lang },
      ogUrl: { property: 'og:url', content: url },
      "twitter:card" : "summary",
      "twitter:site" : config.twitter.name,
      "twitter:title" : utils.escape( req.agenda.getTitle(), false ),
      "twitter:description" : utils.escape( req.agenda.description, false ),
      "twitter:domain" : config.domain,
      "twitter:url" : url
    }
  };

  if ( req.embed ) {

    data.scriptParams.autoscroll = req.embed.getAutoscroll();

  }

  if ( req.agenda.private ) {

    data.bottom = {
      scripts: [ `window.controlData = '/agendas/${req.agenda.uid}/controldata.prv'` ]
    }

  }


  if ( req.agenda.image ) {

    lib.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.agenda.getImage( true ) },
      "twitter:image" : req.agenda.getImage( true )
    });

  }

  if ( !data.headLinks ) data.headLinks = [];

  data.headLinks.push({
    rel: 'canonical',
    href: req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true, protocol: 'https://' } )
  });

  return data;
}

function unauthorizedIP( req, res ) {

  cmn.render( req, res, 'dialog/index', {
    agenda: req.agenda,
    title: forbiddenLabel( 'title', req.lang ),
    content: forbiddenLabel( 'content', req.lang ),
    actions: [ {
      type: 'primary',
      href: `/${req.agenda.slug}/contact`,
      label: forbiddenLabel( 'contact', req.lang )
    }, {
      type: 'default',
      href: `/${req.agenda.slug}`,
      label: forbiddenLabel( 'back', req.lang )
    } ]
  } );

}
