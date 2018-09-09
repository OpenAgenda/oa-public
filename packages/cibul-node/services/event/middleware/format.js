"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const du = require( '@openagenda/dom-utils' );
const timeHelper = require( '@openagenda/cibul-templates' ).helpers.time;
const registration = require( '@openagenda/registration/src/validate' ).getTypesAndValues;

/**
 * prepare event data for display or upload
 * ( links & full pathed images )
 */

module.exports = _.extend( function( req, res, next ) {

  if ( req.event.origin ) {

    req.event.origin.oaUrl = 'https://openagenda.com/agendas/' + req.event.origin.uid;

  }

  w( {
    req,
    res,
    formatted: {
      updatedAt: req.event.updatedAt,
      timezone: req.event.getLocationDetails().timezone,
      origin: req.event.origin
    },
    _t: timeHelper( { lang: req.lang } )
  } )

  .then( _main )

  .then( _keywords )

  .then( _image )

  .then( _timings )

  .then( _dates )

  .then( _location )

  .then( _registration )

  .then( _load( 'owner', 'getOwner' ) )

  .then( _load( 'agendaReferences', 'getAgendaReferences' ) )

  .then( _load( 'adminAgendas', 'getAdminAgendas' ) )

  .then( _load( 'currentState', 'getState' ) )

  .then( _languages )

  .then( _importUri )

  .then( _uri )

  .then( v => {

    const d = w.defer();

    if ( !req.agenda ) return v;

    w( v )

    .then( _categories )

    .then( _featured )

    .done( v => d.resolve( v ), d.reject )

    return d.promise;

  } )

  .done( v => {

    req.formatted = v.formatted;

    next();

  }, next );

}, {
  listifyKeywords
} )


function _location( v ) {

  v.formatted.location = v.req.event.getLocationDetails( v.req.lang, true );

  if ( v.formatted.location && v.formatted.location.description ) {

    v.formatted.location.description = du.nl2br( v.formatted.location.description, true, false );

  }

  return v;

}


function _registration( v ) {

  v.formatted.registration = registration( v.req.event.getTicketLink( true ) );

  return v;

}


function _uri( v ) {

  const reqParams = {
    eventSlug: v.req.event.slug
  }

  if ( v.req.agenda ) {

    reqParams.slug = v.req.agenda.slug;

    if ( v.req.query.admin_nav ) {

      reqParams.admin_nav = v.req.query.admin_nav;

    }

    v.formatted.uri = v.req.genUrl( 'agendaEventShow', reqParams );

  } else {

    v.formatted.uri = v.req.genUrl( 'eventShow', reqParams );

  }

  return v;

}


function _importUri( v ) {

  if ( v.req.agenda ) {

    v.formatted.importUri = v.req.genUrl( 'agendaEventActionShow', {
      slug: v.req.agenda.slug,
      eventSlug: v.req.event.slug
    } );

  } else {

    v.formatted.importUri = v.req.genUrl( 'eventActionShow', {
      eventSlug: v.req.event.slug
    } );

  }

  return v;

}


function _featured( v ) {

  const d = w.defer();

  v.req.event.getFeatured( ( err, featured ) => {

    if ( err ) return d.reject( err );

    v.formatted.featured = featured;

    d.resolve( v );

  } );

  return d.promise;

}


function _categories( v ) {

  const d = w.defer();

  v.req.event.getAgendaCategory( ( err, category ) => {

    if ( err ) return d.reject( err );

    if ( !category ) return d.resolve( v );

    v.formatted.category = category.label;

    v.formatted.categorySlug = category.slug;

    d.resolve( v );

  } );

  return d.promise;

}


function _dates( v ) {

  v.formatted.dates = v.req.event.getDates();

  v.formatted.dates.forEach( d => {

    d.label = v._t( d.date, 'dddd Do MMM' );

    d.timings = d.timings.sort( ( a, b ) => a.start < b.start ? -1 : 1 );

    d.timings.forEach( t => {

      t.label = v._t( t.start, 'dddd Do - HH:mm', v.formatted.timezone );

      t.startLabel = v._t( t.start, 'HH:mm', v.formatted.timezone );

      t.endLabel = v._t( t.end, 'HH:mm', v.formatted.timezone );

    } );

  } );

  return v;

}


function _timings( v ) {

  const _t = timeHelper( { lang: v.req.lang } );

  v.formatted.timings = v.req.event.getTimings().map( t => {

    t.label = v._t( t.start, 'dddd Do - HH:mm', v.formatted.timezone );

    return t;

  } );

  return v;

}


function _languages( v ) {

  v.formatted.languages = false;

  if ( v.req.event.getLanguages().length > 1 ) {

    v.formatted.languages = {
      current: v.req.event.getCurrentLanguage(),
      selection: v.req.event.getLanguages()
    }

  }

  return v;

}


function _load( namespace, fnName ) {

  return v => {

    const d = w.defer();

    v.req.event[ fnName ]( ( err, r ) => {

      if ( err ) return d.reject( err );

      v.formatted[ namespace ] = r;

      d.resolve( v );

    } );

    return d.promise;

  }

}


function _image( v ) {

  const img = v.req.event.getImage( true );

  v.formatted.image = img ? img.replace( 'cibuldev', 'cibul' ) : false;

  if ( img ) {

    v.formatted.credits = v.req.event.credits;

  }

  return v;

}


function _keywords( v ) {

  v.formatted.keywordList = listifyKeywords( v.formatted.keywords );

  return v;

}

function listifyKeywords( keywords ) {

  if ( typeof keywords !== 'string' ) return [];

  return keywords.split( ',' ).map( k => k.trim() ).filter( k => !!k.length );

}


function _main( v ) {

  const map = {
    uid: 'getUid',
    slug: 'getSlug',
    title: 'getTitle',
    description: 'getDescription',
    freeText: 'getEnrichedFreeText',
    keywords: 'getTags',
    dateRange: 'getRange',
    isUpcoming: 'isUpcoming',
    placeName: 'getLocationName',
    address: 'getAddress',
    region: 'getRegion',
    city: 'getCity',
    postalCode: 'getPostalCode',
    latitude: 'getLatitude',
    longitude: 'getLongitude',
    pricingInfo: 'getPricingInfo',
    ticketLink: 'getTicketLink',
    accessibility: 'getAccessibility',
    age: 'getAge'
  };

  Object.keys( map ).forEach( k => {

    v.formatted[ k ] = v.req.event[ map[ k ] ]();

  } );

  return v;

}
