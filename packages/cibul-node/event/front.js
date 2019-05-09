"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const qs = require( 'qs' );

const agendaSvc = require( '@openagenda/agendas' );
const core = require( '../core' );

const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/event/show' ) );
const errorLabels = require( '@openagenda/labels/errors' );
const sessions = require( '@openagenda/sessions' );
const stakeholderSvc = require( '@openagenda/agenda-stakeholders' );
const stakeholderMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );

const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const embedSvc = require( '../services/embed' );
const eventSvc = require( '../services/event' );
const legacyAgendaSvc = require( '../services/agenda' );
const redirectMiddelware = require( './redirect.middleware' )( config );

const log = require( '@openagenda/logs' )( 'event/front' );

const middlewares = {
  agendaEventShow: [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.components,
    _loadAgendaCoreSettings,
    _formatAgendaLinks( 'agendaShow', [ 'slug' ] ),
    legacyAgendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oasfmain.css' ),
    _appendEventTransferCredential,
    _appendSettings,
    _decorateLocation,
    wrap( agendaEventShow )
  ],
  customEmbedEventShow: [
    legacyAgendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    _formatFavoriteLink,
    _addInterfaceLanguage,
    _formatEmbedHeadLinks,
    cmn.useEmbedGoogleAnalytics,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    embedSvc.mw.loadCustomLayoutData,
    _appendSettings,
    agendaEmbedEventShow
  ]
};


const preMw = [
  cmn.loadLogger( 'event front' ),
  cmn.redirectLegacySearch
];


module.exports = app => {

  app.get(
    '/agendas/:agendaUid/events/:eventUid/share',
    preMw,
    redirectMiddelware.loadEvent,
    redirectMiddelware.loadSiteURL,
    redirectMiddelware.loadFacebookMetas,
    redirectMiddelware.render
  );

  app.get(
    '/:slug.prv/events/:eventSlug',
    preMw,
    cmn.https,
    legacyAgendaSvc.mw.load( 'slug' ),
    cmn.ifIsNot(
      'agenda.private',
      ( req, res ) => {
        const query = qs.stringify( req.query, { addQueryPrefix: true } );

        res.redirect( 302, `/${req.params.slug}/events/${req.params.eventSlug}${query}` );
      }
    ),
    sessions.middleware.ifUnlogged(
      ( req, res ) => {
        const query = qs.stringify( req.query, { addQueryPrefix: true } );
        const redirect = new Buffer( `/${req.params.slug}.prv/events/${req.params.eventSlug}${query}`, 'utf8' )
          .toString( 'base64' );

        res.redirect( 302, `/${req.params.slug}/signin?msg=limitedAccessEvent&redirect=${redirect}` );
      }
    ),
    stakeholderMw.agenda().get(),
    cmn.ifIsNot( 'stakeholder', cmn.renderUnauthorized() ),
    middlewares.agendaEventShow
  );

  app.get(
    '/:slug/events/:eventSlug',
    preMw,
    cmn.https,
    legacyAgendaSvc.mw.load( 'slug' ),
    cmn.ifIs(
      'agenda.private',
      ( req, res ) => {
        const query = qs.stringify( req.query, { addQueryPrefix: true } );

        res.redirect( 302, `/${req.params.slug}.prv/events/${req.params.eventSlug}${query}` );
      }
    ),
    middlewares.agendaEventShow
  );

  app.get(
    '/:slug/events/:eventSlug',
    preMw,
    cmn.https,
    legacyAgendaSvc.mw.load( 'slug' ),
    cmn.ifIs(
      'agenda.private',
      ( req, res ) => {
        const query = qs.stringify( req.query, { addQueryPrefix: true } );

        res.redirect( 302, `/${req.params.slug}.prv/events/${req.params.eventSlug}${query}` );
      }
    ),
    middlewares.agendaEventShow
  );

  app.get(
    '/agendas/:uid/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    redirect
  );

  app.get(
    '/agendas/:uid/embed/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'agendaEmbedShow', [ 'uid' ] ),
    legacyAgendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    _formatEmbedHeadLinks,
    cmn.useEmbedGoogleAnalytics,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    _appendFacebookParams,
    agendaEmbedEventShow
  );

  app.get(
    '/agendas/:uid/embeds/:embedUid/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'customEmbedShow', [ 'uid', 'embedUid' ] ),
    middlewares.customEmbedEventShow
  );

  app.get(
    '/agendas/:uid/previewEmbeds/:embedUid/events/:eventUid',
    preMw,
    legacyAgendaSvc.mw.load( 'uid' ),
    cmn.checkAdministrator(),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'customEmbedShowPreview', [ 'uid', 'embedUid' ] ),
    middlewares.customEmbedEventShow
  );

  app.get(
    '/events/:eventSlug',
    preMw,
    cmn.https,
    ( req, res, next ) => {

      const integer = parseInt( req.params.eventSlug );

      if ( Number.isInteger( integer ) && ((integer + '').length === req.params.eventSlug.length) ) {

        return next( 'route' );

      }

      next();
    },
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    ( req, res, next ) => {

      if ( req.event.origin ) {
        req.agenda = req.event.origin;
        return redirect( req, res, next );
      }

      next( {
        code: 403,
        message: _.get( errorLabels, [ 'noOrigin', req.lang ], 'noOrigin.en' )
      } );
    }
  );

  app.get(
    '/events/:eventUid',
    preMw,
    cmn.https,
    eventSvc.mw.load( 'eventUid', 'uid' ),
    ( req, res, next ) => {
      req.agenda = req.event.origin;
      next();
    },
    redirect
  );

};


/**
 * controllers
 */

async function agendaEventShow( req, res, next ) {

  const reqParams = {};

  if ( req.query.admin_nav ) {

    reqParams.admin_nav = req.query.admin_nav;

  }

  const eventUrl = `/${req.agenda.slug}/events/${req.event.slug}`;

  _addLanguageLinks( req, eventUrl, reqParams );

  _addContactLink( req );

  const userStakeholder = req.user
    ? await promisify( stakeholderSvc( req.agenda.id ).get )( { userId: req.user.id } )
    : null;

  req.event.getContributor( ( err, contributor ) => {

    if ( err ) return next( err );

    cmn.render( req, res, 'event/show', {
      scriptParams: {
        contributor,
        agendaSlug: req.agenda.slug,
        agendaImage: req.agenda.image
          ? `${config.aws.imageBucketPath}${req.agenda.image}`
          : config.aws.defaultImagePath
      },
      agendaId: req.agenda.id,
      private: req.agenda.private,
      adminNav: req.query.admin_nav,
      redirect: req.query.admin_nav ? new Buffer( `${eventUrl}?${qs.stringify( req.query )}`, 'utf8' ).toString( 'base64' ) : null,
      event: req.formatted,
      components: req.components,
      userStakeholder,
      user: req.user,
      footerUid: req.formatted.uid
    } );
  } )

}

function redirect( req, res, next ) {

  if ( !req.agenda || !req.event ) return next( { code: 404 } );

  res.redirect( 301, req.genUrl( 'agendaEventShow', {
    slug: req.agenda.slug,
    eventSlug: req.event.slug
  }, {
    protocol: 'https://'
  } ) );

}


function agendaEmbedEventShow( req, res ) {

  cmn.render( req, res, 'event/embedShow', {
    eventRender: req.render,
    scriptParams: {
      res: {
        actions: req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } )
      }
    }
  } );

}


function agendaCustomEmbedEventShow( req, res ) {

  _addLanguageLinks( req, `/agendas/${req.params.uid}/embeds/${req.params.embedUid}/events/${req.params.eventUid}` );

  // back link needs to

  cmn.render( req, res, 'event/embedShow', {
    event: req.formatted,
    backUri: 'customEmbedShow',
    backQuery: { uid: req.params.uid, embedUid: req.params.embedUid }
  } );

}


function show( req, res ) {

  _addLanguageLinks( req, `/events/${req.params.eventSlug}` );

  _addContactLink( req );

  cmn.render( req, res, 'event/show', { event: req.formatted } );

}


function _appendFacebookParams( req, res, next ) {

  if ( !req.query.fb ) return next();

  // to add 'fb' class to layout html
  req.baseData.facebook = true;

  req.baseData.scriptParams.facebook = true;

  req.baseData.scriptParams.fbAppId = config.auth.facebook.id;

  next();

}


function _addLanguageLinks( req, url, urlParams ) {

  var linkedLanguages = [];

  if ( !req.formatted.languages ) return;

  req.formatted.languages.selection.forEach( lang => {

    linkedLanguages.push( {
      label: lang,
      link: url + qs.stringify( { ...urlParams, lang }, { addQueryPrefix: true } )
    } );

  } );

  req.formatted.languages.selection = linkedLanguages;

}


function _addContactLink( req ) {

  if ( !req.formatted.owner ) return;

  req.formatted.owner.contactLink = req.genUrl( 'conversationDiscussion', {
    uid: req.formatted.owner.uid,
    redirect: new Buffer( req.genUrl( req.agenda ? 'agendaEventShow' : 'eventShow', req.agenda ? {
      slug: req.agenda.slug,
      eventSlug: req.event.slug
    } : { eventSlug: req.event.slug }, { abs: true } ) ).toString( 'base64' )
  } );

}


function _switchEmbedLang( req, res, next ) {

  req.event.switchLanguage( req.lang );

  next();

}


function _formatAgendaLinks( uri, keys ) {

  return function ( req, res, next ) {

    const routeValues = _getRouteValues( req, keys );

    const baseSearchQuery = {};

    if ( req.query.fb ) routeValues.fb = 1;

    if ( req.query.oaq && req.query.oaq.passed !== undefined ) {

      baseSearchQuery.passed = req.query.oaq.passed;

    }

    // link to go back to the agenda
    req.formatted.backLink = req.genUrl( uri, [
      routeValues,
      req.query.oaq ? { oaq: req.query.oaq } : {},
      { lang: req.lang }
    ] );

    req.formatted.backLabel = getLabel( 'back', req.lang );

    // link to results for event location in agenda
    req.formatted.locationLink = req.genUrl( uri, [
      routeValues,
      { oaq: _.extend( { location: req.event.getLocationUid() }, baseSearchQuery ) },
      { lang: req.lang }
    ] );

    req.formatted.googleItineraryLink = _googleItineraryLink( req.event.getLatitude(), req.event.getLongitude() );

    // link to results for same category in agenda
    req.formatted.categoryLink = false;

    if ( req.formatted.categorySlug ) {

      req.formatted.categoryLink = req.genUrl( uri, [
        routeValues,
        { oaq: _.extend( { category: req.formatted.categorySlug }, baseSearchQuery ) },
        { lang: req.lang }
      ] );

    }

    next();

  }

}

function _getRouteValues( req, keys ) {

  const routeValues = [];

  if ( typeof keys == 'string' ) keys = [ keys ];

  keys.forEach( function ( k ) {

    routeValues[ k ] = req.params[ k ];

  } );

  return routeValues;

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'agendaEmbedShow', {
    uid: req.params.uid,
    lang: req.lang
  } );


  req.formatted.locationLink = req.genUrl( 'agendaEmbedShow', {
    uid: req.params.uid,
    oaq: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  } );

  req.formatted.googleItineraryLink = _googleItineraryLink( req.event.getLatitude(), req.event.getLongitude() );

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'agendaEmbedShow', {
      uid: req.params.uid,
      oaq: {
        category: req.formatted.categorySlug
      }
    } );

  }

  req.formatted.backLabel = getLabel( 'back', req.lang );

  next();

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatCustomEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'customEmbedShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    lang: req.lang
  } );

  req.formatted.locationLink = req.genUrl( 'customEmbedShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    oaq: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  } );

  req.formatted.googleItineraryLink = _googleItineraryLink( req.event.getLatitude(), req.event.getLongitude() );

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'customEmbedShow', {
      uid: req.params.uid,
      embedUid: req.params.embedUid,
      oaq: {
        category: req.formatted.categorySlug
      },
      lang: req.lang
    } );

  }

  req.formatted.backLabel = getLabel( 'back', req.lang );

  next();

}


function _appendEventTransferCredential( req, res, next ) {

  req.baseData.hasOwnershipTransfer = false;

  req.baseData.scriptParams.hasOwnershipTransfer = false;

  req.agenda.hasCredential( 'eventTransfer', ( err, has ) => {

    req.baseData.hasOwnershipTransfer = has;

    req.baseData.scriptParams.hasOwnershipTransfer = has;

    next();

  } );

}





function _appendSettings( req, res, next ) {

  if ( !req.agenda ) return next();

  const agendaUid = _.get( req, 'agenda.uid' );
  const originAgendaUid = _.get( req, 'event.origin.uid' );

  const agendaUids = [ agendaUid ];

  if ( originAgendaUid ) agendaUids.push( originAgendaUid );

  agendaSvc.list( { uid: agendaUids }, 0, 2, { private: null, internal: true, includeFields: [ 'settings', 'indexed', 'private', 'credentials' ] }, ( err, agendas ) => {

    const agenda = _.first( agendas.filter( a => a.uid === agendaUid ) );

    if ( err ) return next( err );

    req.baseData = ih( req.baseData, {
      indexed: {
        $set: _.get( agenda, 'indexed', true ) && !_.get( agenda, 'private', false )
      },
      scriptParams: {
        moderatorCanPublish: {
          $set: _.get( agenda, 'settings.contribution.canPublish', [ 'moderators', 'administrators' ] ).includes( 'moderators' )
        }
      },
      mailto: {
        $set: cmn.agendaMailTo( agenda )
      },
      useContributeApp: {
        $set: _.get( agenda, 'credentials.useContributeApp', false )
      },
      bottom: {
        scripts: { $push: [ cmn.extractGoogleAnalytics( agendas ) ] }
      }
    } );

    next();

  } );

}


function _formatFavoriteLink( req, res, next ) {

  req.formatted.favorite = cmn.favoriteLinkHTML( req.event.uid );

  next();

}

function _addInterfaceLanguage( req, res, next ) {

  req.formatted.interfaceLang = req.lang;

  next();

}


function _formatSocialLinks( req, res, next ) {

  let siteUrl = false,

    eventUrl,

    fbAppId,

    externalSite = false;

  if ( req.agenda ) {

    eventUrl = req.genUrl( 'agendaEventShow', {
      slug: req.agenda.slug,
      eventSlug: req.event.slug
    }, { protocol: 'https://' } );

    siteUrl = req.genUrl( 'agendaShow', {
      slug: req.agenda.slug
    }, { protocol: 'https://' } );

  } else {

    eventUrl = req.genUrl( 'eventShow', {
      eventSlug: req.event.slug
    }, { protocol: 'https://' } );

  }

  if ( req.embed ) {

    if ( req.embed.getSiteUrl() ) {

      externalSite = true;

      siteUrl = req.embed.getSiteUrl();

      eventUrl = siteUrl + '?oaq[uid]=' + req.event.uid;

    }

  }

  _.merge( req.formatted, eventSvc.share.getSocialLinks( req.event, eventUrl, siteUrl ) );

  if ( req.embed ) {

    req.formatted.facebookShare = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent( `${config.root}/agendas/${req.agenda.uid}/events/${req.event.uid}/share` );

  }

  next();

}


function _formatEmbedHeadLinks( req, res, next ) {

  req.formatted.actionLink = req.genUrl( 'agendaEventActionShow', {
    slug: req.agenda.slug,
    eventSlug: req.event.slug
  }, { protocol: 'https://' } );
  req.formatted.actionLabel = getLabel( 'export', req.lang );

  next();

}

function _googleItineraryLink( lat, lng ) {

  return `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},17z`;

}

function _googleMapsLink( lat, lng ) {

  return `https://maps.google.com/maps?q=${lat},${lng}&z=15`

}

function wrap( fn ) {

  return ( req, res, next ) => fn( req, res, next ).catch( next );

}

function _loadAgendaCoreSettings( req, res, next ) {

  core.agendas( req.agenda.uid ).settings.get().then( settings => {

    req.agendaSettings = settings;

    next();

  }, err => {

    if ( err ) {

      log( 'error', 'failed to load core settings for %s', req.originalUrl );

    }

    next();

  } );

}

function _decorateLocation( req, res, next ) {

  const locationTags = _.get( req, 'formatted.location.tags', [] );

  if ( !locationTags.length ) return next();

  const locationField = _.first(
    _.get( req, 'agendaSettings.fields', [] )
      .filter( f => f.field === 'location' )
  );

  if ( !locationField ) return next();

  try {

    const tags = _.get( locationField, 'legacy.tagSet.groups', [] )
      .reduce( ( tags, g ) => tags.concat( g.tags ), [] );

    req.formatted.location.tags = locationTags
      .map( t => {

        const matching = _.first( tags.filter( tag => tag.id === t.id ) );

        t.label = _.get( matching, [ 'label', req.lang ] ) || t.label;

        return t;

      } );

  } catch ( e ) {

    log( 'error', 'failed to use schema tags for location of event %s', _.get( req, 'formatted.event.uid' ), e );

  }

  next();

}
