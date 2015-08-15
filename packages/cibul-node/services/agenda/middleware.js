"use strict";

var svc,

csv = require( 'fast-csv' ),

utils = require( '../../lib/utils' ),

svcConfig = require( './config' ),

eventSvc = require( '../event' );

module.exports = function( agendaService ) {

  svc = agendaService;

  return {
    load: loadAgenda,
    loadAdminLayout: loadAdminLayout,
    search: searchEvents,
    browserCache: browserCache,
    decorateEvents: decorateEvents,
    decorateEvent: decorateEvent,
    cleanJson: cleanJson,
    buildCsv: buildCsv
  }

}



/**
 * load agenda instance and set it in req.agenda
 */

function loadAgenda( paramName, fieldName, options ) {

  var loadOptions = {
    name: 'agenda'
  }; // options used for function, not for get

  if ( arguments.length === 2 && typeof fieldName == 'object' ) {

    options = fieldName;

    fieldName = undefined;

  }

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  if ( !options ) options = {};

  // extract options for function
  [ 'name' ].forEach( function( k ) {

    if ( options[ k ] === undefined ) return;

    loadOptions[ k ] = options[ k ];

    delete options[ k ];

  });

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, options, function( err, a ) {

      if ( err ) {

        if ( err == 'agenda not found' ) {

          return next( { code: 404 } );

        } else {

          return next( 'agenda service error' );

        }

      }

      req[ loadOptions.name ] = a;

      if ( options.basicLoad ) return next();

      // if full load ( default )
      // is requested, more info is fetched

      _loadIsPassed( req[ loadOptions.name ], function( err ) {

        if ( err ) return next( err );

        req[ loadOptions.name ].hasPublishedEvents( function( err, has ) {

          if ( err ) return next( err );

          req.agenda.isEmpty = !has;

          next();

        });

      } );

    } );

  }

}


/**
 *  load data required for an agenda administration page
 */

function loadAdminLayout( req, res, next ) {

  req.layoutData = {
    agenda: {
      slug: req.agenda.slug,
      uid: req.agenda.uid,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false )
    }
  }

  req.agenda.getCredentialList( function( err, credentials ) {

    req.log( 'loaded credentials %s', credentials );

    if ( err ) return next( err );

    // filter tabs where agenda does not have required creds

    req.layoutData.tabs = svcConfig.adminTabs.filter( function( tab ) {

      if ( tab.requiredCred === undefined ) return true;

      return credentials.indexOf( tab.requiredCred ) !== -1;

    } );

    next();

  });

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

    var pagination = {};

    if ( req.query.offset ) {

      pagination.offset = parseInt( req.query.offset, 10 );

    } else {

      pagination.page = parseInt( req.query.page, 10 );

    }

    req.agenda.search( req.query.search, utils.extend( {
      limit: Math.min( parseInt( req.query.limit ? req.query.limit : limit, 10 ), 300 ),
      showAll: showAll
    }, pagination ), function( err, data ) {

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

    var instanciated = req.events.map( eventSvc.instanciate )

    svc.exports.decorateEvents( req.agenda, instanciated, req.formatted, {
      includePrivateData: !!includePrivateData
    }, next );

  }

}

function decorateEvent( includePrivateData ) {

  return function( req, res, next ) {

    svc.exports.decorateEvent( req.agenda, req.event, req.formatted, {
      includePrivateData: false
    }, next );

  }

}

function cleanJson( req, res, next ) {

  req.formatted.forEach( function( f ) {

    if ( f.customValues ) {

      f.custom = f.customValues;

      delete f.customValues;

      delete f.customLabels;

    }

  });

  next();

}


function buildCsv( includePrivateData ) {

  return function( req, res, next ) {

    req.agenda.flattener( includePrivateData, function( err, f ) {

      if ( err ) return next( err );

      var stream = req.agenda.searchStream( req.query.search, {
        showAll: includePrivateData 
      } ),

      csvStream = csv.createWriteStream( {
        headers: true,
        delimiter: ';',
        quote: '"',
        escape: '"'
      } ),

      defaultRow = {}, processing = 0, end;

      // csv must have all column filled with empty values
      f.getFieldNames().forEach( function( n ) {

        defaultRow[ n ] = '';

      });

      csvStream.pipe( res );

      res.writeHead( 200, {
        'Content-Type': 'text/csv',
        'content-disposition': [
          'attachment; filename=\"',
          req.agenda.title,
          '.', _stringifiedNow(),
          '.csv\"' ].join('')
      } );

      stream.on( 'data', function( eventData ) {

        stream.pause();

        processing++;

        // instanciate
        var eInst = eventSvc.instanciate( eventData );

        // clean event
        eventSvc.exports.clean( eInst, function( err, clean ) {

          // decorate with agenda related data
          svc.exports.decorateEvent( req.agenda, eInst, clean, {
            includePrivateData: !!includePrivateData
          }, function( err, clean ) {

            if ( err ) {

              req.log( 'error', err );

              return stream.resume();

            }

            processing--;

            csvStream.write( utils.extend( {}, defaultRow, f.flatten( clean ) ) );

            stream.resume();

            if ( !processing && end ) {

              csvStream.end();

            }

          } );

        } );


      } );

      stream.on( 'end', function() {

        end = true;

      });

    } );

  }

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