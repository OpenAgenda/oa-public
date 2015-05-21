"use strict";

var svc,

svcCsv = require( '../csv' ),

utils = require( '../../lib/utils' );

module.exports = function( agendaService ) {

  svc = agendaService;

  return {
    load: loadAgenda,
    search: searchEvents,
    browserCache: browserCache,
    decorateEvents: decorateEvents,
    buildCsv: buildCsv,
    renderCsv: renderCsv
  }

}



/**
 * load agenda instance and set it in req.agenda
 */

function loadAgenda( paramName, fieldName, basicLoad ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, function( err, a ) {

      if ( err ) {

        if ( err == 'agenda not found' ) {

          return next( { code: 404 } );

        } else {

          return next( 'agenda service error' );

        }

      }

      req.agenda = a;

      if ( basicLoad ) return next();

      // if full load ( default )
      // is requested, more info is fetched

      _loadIsPassed( req.agenda, function( err ) {

        if ( err ) return next( err );

        req.agenda.hasPublishedEvents( function( err, has ) {

          if ( err ) return next( err );

          req.agenda.isEmpty = !has;

          next();

        });

      } );

    } );

  }

}

function formatTemplateData( req, res, next ) {

  req.template = 'agenda/show';

  req.templateData = {
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    title: req.agenda.title,
    description: req.agenda.description,
    url: req.agenda.url,
    image: req.agenda.getImage( false ),
    passed: req.agenda.passed,
    uri: 'agendaShow'
  };

  req.templateData.importUri = req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } );

  req.templateData.hasSearchQuery = !!utils.size( req.query.search );

  next();

}


function searchEvents( limit, showAll ) {

  return function( req, res, next ) {

    req.agenda.search( req.query.search, {
      limit: limit,
      page: req.query.page,
      showAll: showAll
    }, function( err, data ) {

      if ( err ) return next( err );

      req.events = data.events;

      req.total = data.total;

      next();

    } );

  }

}


function browserCache( req, res, next ) {

  var lastUpdate = req.agenda.updatedAt;

  if ( _hasQueryOtherThan( req, 'callback' ) ) {

    return next();

  }

  if ( req.headers[ 'if-modified-since' ] === lastUpdate.toString() ) {

    res.status( 304 ).end();

    return;

  }

  res.set( 'Last-Modified', req.agenda.updatedAt );

  next();

}

function decorateEvents( includePrivateData ) {

  return function( req, res, next ) {

    svc.exports.decorateEvents( req.agenda, req.events, req.formatted, {
      genUrl: req.genUrl,
      includePrivateData: !!includePrivateData
    }, next );

  }

}


function buildCsv( includePrivateData ) {

  var baseMapping = [
    'uid',
    'title',
    'description',
    'longDescription',
    'image',
    'thumbnail',
    'originalImage',
    'updatedAt',
    'range',
    'conditions',
    'registrationUrl',
    'locationName',
    'locationUid',
    'address',
    'postalCode',
    'city',
    'district',
    'department',
    'region',
    'latitude',
    'longitude',
    'featured'
  ];

  return function( req, res, next ) {

    var mapping;

    if ( !res.csv ) {

      mapping = _appendMapping( req.agenda, baseMapping, includePrivateData );

      res.csv = svcCsv( res, {
        sourceField: 'formatted',
        mapping: mapping
      } );

    }

    if ( !res.headersSent ) {

      res.writeHead( 200, {
        'Content-Type': 'text/csv',
        'content-disposition': [
          'attachment; filename=\"',
          req.agenda.title,
          '.', _stringifiedNow(),
          '.csv\"' ].join('')
      } );

    }

    res.csv.write( req );

    next();

  }

}


function renderCsv( req, res, next ) {

  res.csv.end();
  
}

function _appendMapping( agenda, baseMapping, includePrivateData ) {

  var amendment = [ { 
    sourceField: 'category',
    fn: function( c ) { return c.label }
  }, { 
    sourceField: 'tags',
    fn: function( t ) { return t ? t.map( function( t ) { return t.label } ).join( ', ') : '' }
  } ],

  customFields = agenda.getCustomFieldsConfig();

  if ( includePrivateData ) amendment.push( 'state' );

  customFields.forEach( function( cField ) {

    if ( includePrivateData || ( cField.type !== 'private' ) ) {

      amendment.push( [ cField.name, 'custom.' + cField.name ] );

    }

  });

  return baseMapping.concat( amendment );

}


function _loadIsPassed( agenda, cb ) {

  var now = new Date();

  agenda.getLastOccurrence( function( err, lastOccurrence ) {

    if ( err ) return cb( err );

    agenda.passed = lastOccurrence ? ( now > new Date( lastOccurrence.end ) ) : false;

    cb();

  });

}


function _hasQueryOtherThan( req, exceptions ) {

  if ( typeof exceptions == 'string' ) exceptions = [ exceptions ];

  if ( !exceptions ) exceptions = [];

  for( var q in req.query ) {

    if ( exceptions.indexOf( q ) == -1 ) return true;

  }

  return false;

}


function _stringifiedNow() {

  var now = new Date();

  return _fZ( now.getMonth() + 1 ) + _fZ( now.getDate() );

}

function _fZ( n ) {

  return ( n>9 ? '' : '0' ) + n;

}