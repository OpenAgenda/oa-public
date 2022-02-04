"use strict";

const pickEventImage = require( './lib/pickImage' );

const log = require( '@openagenda/logs' )( 'services/event/exportLib' );
const getLongDescriptionHTML = require('./lib/getLongDescriptionHTML');

const linkValidator = require('@openagenda/validators/link')();

const toUTC = str => (new Date(str)).toJSON();

const _ = require( 'lodash' ),

  async = require( 'async' ),

  moment = require( 'moment-timezone' ),

  genUrl = require( '../genUrl' ),

  registration = require( '@openagenda/registration/src/validate' ).getTypesAndValues,

  config = require( '../../config' ),

  legacyLocationFieldsMap = {
    conditions: 'pricingInfo',
    registrationUrl: 'ticketLink',
    locationName: 'name',
    locationUid: 'uid',
    address: 'address',
    postalCode: 'postcode',
    city: 'city',
    district: 'district',
    department: 'department',
    region: 'region',
    latitude: 'latitude',
    longitude: 'longitude',
    timings: 'timings'
  },

  locationFieldsMap = {
    uid : 'uid',
    name : 'name',
    slug : 'slug',
    address : 'address',
    image: 'image',
    imageCredits: 'imageCredits',
    postalCode : 'postcode',
    city: 'city',
    district: 'district',
    department: 'department',
    region: 'region',
    latitude: 'latitude',
    longitude: 'longitude',
    description: 'description',
    access: 'access',
    countryCode: 'countryCode',
    website: 'website',
    email: 'email',
    links: 'links',
    insee: 'insee',
    phone: 'phone',
    tags: 'tags',
    timezone: 'timezone',
    updatedAt: 'updatedAt',
    extId: 'extId'
  }

let svc;

module.exports = service => {

  svc = service;

  return {
    cleanEvents,
    clean: cleanEvent
  }

}


function cleanEvent(services, eInst, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;

    options = {};

  }

  let dateRange;

  try {
    dateRange = eInst.getDateRange( true );
  } catch ( e ) {
    log( 'error', 'failed fetching date range for event %s, (%s)', eInst.slug, eInst.uid, e );
  }

  const OEmbedLinks = eInst.getLinks();

  const c = {
    uid: eInst.uid,
    slug: eInst.slug,
    canonicalUrl: genUrl( 'eventShow', { eventSlug: eInst.slug }, { protocol: 'https://' } ),
    title: eInst.title,
    description: eInst.description,
    longDescription: eInst.freeText || {},
    keywords: _extractKeywords( eInst ),
    html: getLongDescriptionHTML({ services }, eInst.freeText || {}, options.includeEmbedded ? OEmbedLinks : null),
    longDescriptionLinks: OEmbedLinks,
    image: eInst.getImage(),
    thumbnail: pickEventImage( config, eInst, 'thumbnail' ),
    originalImage: pickEventImage( config, eInst, 'full' ),
    age: eInst.getAge(),
    accessibility: eInst.getAccessibility(),
    updatedAt: eInst.updatedAt,
    createdAt: eInst.createdAt,
    range: {
      fr: eInst.getRange('fr'),
      en: eInst.getRange('en'),
      de: eInst.getRange('de'),
      es: eInst.getRange('es'),
      it: eInst.getRange('it')
    },
    location: null,
    attendanceMode: eInst.attendanceMode,
    onlineAccessLink: eInst.onlineAccessLink || null,
    status: eInst.status || 1
  };

  const l = eInst.locations.length ? eInst.locations[ 0 ] : false;

  if ( c.image ) {

    c.imageCredits = eInst.imageCredits || null;

  }

  if ( eInst.origin ) {

    c.origin = eInst.origin;

    c.origin.oaUrl =  genUrl( 'agendaRedirect', { uid : c.origin.uid }, { protocol: 'https://' } );

  }

  if ( l && l.uid ) {

    _inject( c, l, legacyLocationFieldsMap );

    c.location = {};

    _inject( c.location, l, locationFieldsMap );

    if ( c.location.image && c.location.image.indexOf( '//' ) == -1 ) {

      c.location.image = config.aws.imageBucketPath.replace( 'https:', '' ) + c.location.image;

    }

  }

  c.registration = registration( c.registrationUrl );
  c.registrationUrl = ((c.registration || []).filter(v => v.type === 'link').pop() || { value: null }).value;

  let timezone = eInst.getLocationDetails().timezone;

  eInst.getTimings( ( err, timings ) => {

    if ( err ) return cb( err );

    let tFirst, tLast;

    _.extend( c, {
      firstDate: null,
      firstTimeStart: null,
      firstTimeEnd: null,
      lastDate: null,
      lastTimeStart: null,
      lastTimeEnd: null
    } );

    if ( timings.length ) {

      tFirst = {
        start: new Date( timings[ 0 ].start ),
        end: new Date( timings[ 0 ].end )
      };

      tLast = {
        start: new Date( timings[ timings.length - 1 ].start ),
        end: new Date( timings[ timings.length - 1 ].end )
      };

      _.extend(c, {
        timings: timings.map(t => ({
          start: toUTC(t.start),
          end: toUTC(t.end)
        })),
        firstDate: moment.tz(tFirst.start, timezone).format('YYYY-MM-DD'),
        firstTimeStart: moment.tz( tFirst.start, timezone ).format( 'HH:mm' ),
        firstTimeEnd: moment.tz( tFirst.end, timezone ).format( 'HH:mm' ),
        lastDate: moment.tz(tLast.start, timezone).format('YYYY-MM-DD'),
        lastTimeStart: moment.tz( tLast.start, timezone ).format( 'HH:mm' ),
        lastTimeEnd: moment.tz( tLast.end, timezone ).format( 'HH:mm' )
      });

    }

    cb( null, c );

  });

}


function _inject( c, l, map ) {

  for( var f in map ) {

    c[ f ] = null;

    if ( l[ map[ f ] ] ) {

      c[ f ] = l[ map[ f ] ];

    }

  }

}


function cleanEvents( services, events, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  async.map( events, function( e, mcb ) {

    cleanEvent( services, svc.instanciate( e ), options, mcb );

  }, cb );

}



function _fZ( n ) {

  return (n>9?'':'0') + n;

}

function _extractKeywords( e ) {

  if ( !e.tags ) return e.tags;

  let keywords = {};

  try {

    Object.keys( e.tags ).forEach( l => {

      keywords[ l ] = e.tags[ l ] ? e.tags[ l ].split( ',' ).map( k => k.trim() ).filter( k => k.length ) : [];

    } );

  } catch( e ) {}


  return keywords;

}

function isLink(v) {
  try {
    linkValidator(v);
  } catch (e) {
    return false;
  }
  return true;
}