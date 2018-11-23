"use strict";

const async = require( 'async' );
const bodyMw = require( 'body-parser' ).urlencoded( {
  extended: true,
  limit: 500000
} );

const _ = require( 'lodash' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/event/actions' ) );
const mails = require( '@openagenda/mails' );
const sessions = require( '@openagenda/sessions' );
const formSchemasSvc = require( '@openagenda/form-schemas' );
const customSvc = require( '@openagenda/custom' );
const formSchemaDecorate = require( '@openagenda/form-schemas/iso/getDecorate' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const eventSvc = require( '../services/event' );
const model = require( '../services/model' );
const modLib = require( '../lib/moduleLib' );

const routes = {

  eventActionShow: [ 'get', '/events/:eventSlug/action', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionShow
  ] ],

  eventActionDatesShow: [ 'get', '/events/:eventSlug/action/dates', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionDatesShow
  ] ],

  agendaEventActionShow: [ 'get', '/:slug/events/:eventSlug/action', [
    agendaSvc.mw.load( 'slug' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionShow
  ]],

  agendaEventActionDatesShow: [ 'get', '/:slug/events/:eventSlug/action/dates', [
    agendaSvc.mw.load( 'slug' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionDatesShow
  ] ],

  agendaEventMailSend: [ 'post', '/:slug/events/:eventSlug/email', [
    bodyMw,
    agendaSvc.mw.load( 'slug' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    eventMailSend
  ] ],

  agendaEventIcsShow: [ 'get', '/:slug/events/:eventSlug/ics', [
    agendaSvc.mw.load( 'slug' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.ics
  ] ],

  eventMailSend: [ 'post', '/events/:eventSlug/email', [
    bodyMw,
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    eventMailSend
  ] ]

}

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};


function actionShow( req, res ) {

  var loaders = {
    calendars: _calendarAction,
    agendas: _agendasAction,
    email: _emailAction
  },

  actions = [ 'calendars', 'agendas', 'email' ];

  if ( req.query.action && actions.indexOf( req.query.action ) !== -1 ) {

    actions = [ req.query.action ];

  };

  req.templateData = {
    actions: actions,
    event: {
      uid: req.event.uid,
      title: req.event.getTitle(),
      imports: [],
      uri: req.eventUri,
      params: req.eventUriParams
    },
    agenda: req.agenda ? req.agenda : false
  };

  sessions.isLogged( req ).then( is => {

    req.templateData.logged = is;

    if ( req.query.back ) {

      req.templateData.back = req.query.back;

    }

    async.eachSeries( actions, ( action, scb ) => {

      loaders[ action ]( req, res, scb );

    }, err => {

      if ( err ) return next( err );

      return cmn.render( req, res, 'event/action', req.templateData );

    } );

  } );


}


function actionDatesShow( req, res ) {

  var service = [ 'google', 'yahoo', 'live', 'ics' ].indexOf( req.query.service ) !== -1 ? req.query.service : 'google';

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ), req.agenda );

  return cmn.render( req, res, 'event/actionDates', {
    event: {
      uri: req.eventUri,
      timezone: req.event.getLocationDetails().timezone,
      params: req.eventUriParams,
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


async function eventMailSend( req, res, next ) {

  req.formatted.uri = req.eventUri;
  req.formatted.uriParams = req.eventUriParams;

  try {
    const { formSchemaId } = req.agenda;
    let customData = null;

    if ( formSchemaId ) {
      const formSchema = await formSchemasSvc.get( formSchemaId );
      const customValues = await customSvc( formSchemaId ).get( req.event.uid );

      if ( formSchema && formSchema.fields && customValues ) {
        customData = _.reduce(
          formSchemaDecorate( formSchema.fields )( customValues ),
          ( result, value, key ) => {
            if ( value === null ) {
              return result;
            }

            const getLocaleLabel = field => field.label[ req.lang ] || field.label[ Object.keys( field.label )[ 0 ] ];
            const fieldSchema = _.find( formSchema.fields, [ 'field', key ] );
            const label = getLocaleLabel( fieldSchema );

            return {
              ...result,
              [ label ]: typeof value !== 'object'
                ? value
                : Array.isArray( value )
                  ? value.map( getLocaleLabel )
                  : getLocaleLabel( value )
            };
          },
          {}
        );
      }
    }

    const emails = ( typeof req.body.mailsend === 'string' ? req.body.mailsend : '' ).split( /[\s;,\n\r]+/ );

    req.log( 'will send event as email to %s', emails.join( ', ' ) );

    const logo = req.agenda.image
      ? {
        src: config.aws.imageBucketPath + req.agenda.image.replace( '.com/', '.com/rwtb' ),
        width: '100px'
      }
      : {
        src: `${config.root}/images/openagenda.png`,
        width: '300px'
      };

    const link = req.genUrl(
      'agendaEventShow',
      { slug: req.agenda.slug, eventSlug: req.event.slug },
      { abs: true, protocol: 'https://' }
    );

    await mails( {
      template: 'event',
      to: emails.map( email => ( {
        address: email,
        unsubscriptions: [ {
          rule: [ 'receive', 'event' ],
          dataPath: 'unsubscribeLink'
        } ]
      } ) ),
      data: {
        logo,
        link,
        agendaTitle: req.agenda.title,
        event: {
          ...req.formatted,
          ..._.mapValues(
            _.pick( req.formatted, 'placeName', 'address', 'region', 'city', 'postalCode' ),
            v => v.toString()
          )
        },
        customData,
        map: {
          name: req.formatted.placeName,
          lat: req.formatted.latitude,
          lng: req.formatted.longitude,
          zoom: 16,
          accessToken: config.mapboxAccessToken
        }
      },
      lang: req.lang
    } );

    sessions.setFlash( req, res, __( 'eventEmailSend', { 'count' : emails.length } ) );
    res.redirect( 302, req.genUrl( req.eventUri, req.eventUriParams ) );
  } catch ( err ) {
    return next( err );
  }

}


function _conditionalLayout( func, css ) {

  return function( req, res, next ) {

    if ( req.xhr ) return next();

    cmn.loadBaseData( func, css )( req, res, next );

  }

}


function _calendarAction( req, res, next ) {

  var timings = req.event.getTimings(),

  multipleTimings = timings.length > 1,

  datesUri = req.agenda ? 'agendaEventActionDatesShow' : 'eventActionDatesShow';

  if ( req.agenda ) {

    req.eventUriParams.slug = req.agenda.slug;

  }

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ), req.agenda );

  req.templateData.event.imports = timings.length ? [ {
    label: 'Google Calendar',
    uri: multipleTimings ? req.genUrl( datesUri, [ req.eventUriParams, { service: 'google' } ] ) : timings[ 0 ].calendarLinks.google,
  }, {
    label: 'Yahoo! Calendar',
    uri: multipleTimings ? req.genUrl( datesUri, [ req.eventUriParams, { service: 'yahoo' } ] ) : timings[ 0 ].calendarLinks.yahoo,
  }, {
    label: 'Windows Live',
    uri: multipleTimings ? req.genUrl( datesUri, [ req.eventUriParams, { service: 'live' } ] ) : timings[ 0 ].calendarLinks.live
  }, {
    label: 'ICS',
    uri: multipleTimings ? req.genUrl( datesUri, [ req.eventUriParams, { service: 'ics' } ] ) : timings[ 0 ].calendarLinks.ics
  } ] : [];

  req.templateData.event.multipleTimings = multipleTimings;

  next();

}

function _agendasAction( req, res, next ) {

  sessions.get( req, { detailed: true }, ( err, session ) => {

    if ( err || !session ) {

      return next( err );

    }

    const originUid = _.get( req.event, 'origin.uid' );

    req.event.getAgendaReferences( { isPublished: null, internal: true }, ( err, agendasSharing ) => {

      model.reviews().list( {
        stakeholderId: session.id,
        limit: 200
      }, ( err, agendas ) => {

        if ( err ) return next( err );

        req.templateData.agendas = agendas.filter( a => a.uid !== originUid ).map( a => ( {
          uid: a.uid,
          slug: a.slug,
          title: a.title,
          sharing: agendasSharing.map( a => a.id ).indexOf( a.id ) !== -1,
          redirect: req.agenda ?
            new Buffer( req.genUrl( 'agendaEventActionShow', { slug: req.agenda.slug, eventSlug: req.event.slug } ) ).toString( 'base64' )
            : new Buffer( req.genUrl( 'eventActionShow', { eventSlug: req.event.slug } ) ).toString( 'base64' )
        } ) );

        next();

      } );

    } );

  } );


}

function _emailAction( req, res, next ) {

  if ( req.agenda ) {

    req.templateData.mailSendUri = req.genUrl( 'agendaEventMailSend', {
      eventSlug: req.event.slug,
      slug: req.agenda.slug
    } );

  } else {

    req.templateData.mailSendUri = req.genUrl( 'eventMailSend', {
      eventSlug: req.event.slug
    } );

  }

  next();

}
