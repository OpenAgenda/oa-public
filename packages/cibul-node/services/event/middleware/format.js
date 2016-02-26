"use strict";

var w = require( 'when' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

registration = require( 'registration/src/validate' ).getTypesAndValues;

/**
 * prepare event data for display or upload
 * ( links & full pathed images, )
 */

module.exports = function( req, res, next ) {

  w( {
    req: req,
    res: res,
    formatted: {},
    _t: timeHelper( { lang: req.lang } )
  } )

  .then( _main )

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

  .then( v => {

    let d = w.defer();

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

}


function _location( v ) {

  v.formatted.location = v.req.event.getLocationDetails( v.req.lang );

  return v;

}

function _registration( v ) {
  
  v.formatted.registration = registration( v.req.event.getTicketLink( true ) );

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

  let d = w.defer();

  v.req.event.getFeatured( ( err, featured ) => {

    if ( err ) return d.reject( err );

    v.formatted.featured = featured;

    d.resolve( v );

  } );

  return d.promise;

}


function _categories( v ) {

  let d = w.defer();

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

    d.timings.forEach( t => {

      t.label = v._t( t.start, 'dddd Do - HH:mm' );

      t.startLabel = v._t( t.start, 'HH:mm' );

      t.endLabel = v._t( t.end, 'HH:mm' );

    } );

  } );

  return v;

}


function _timings( v ) {

  var _t = timeHelper( { lang: v.req.lang } );

  v.formatted.timings = v.req.event.getTimings().map( t => {

    t.label = v._t( t.start, 'dddd Do - HH:mm' );

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

    var d = w.defer();

    v.req.event[ fnName ]( ( err, r ) => {

      if ( err ) return d.reject( err );

      v.formatted[ namespace ] = r;

      d.resolve( v );

    } );

    return d.promise;

  }

}


function _image( v ) {

  var img = v.req.event.getImage( true );

  v.formatted.image = img ? img.replace( 'cibuldev', 'cibul' ) : false;

  return v;

}


function _main( v ) {

  var map = {
    uid: 'getUid',
    slug: 'getSlug',
    title: 'getTitle',
    description: 'getDescription',
    freeText: 'getEnrichedFreeText',
    tags: 'getTags',
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