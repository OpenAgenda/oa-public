"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const csv = require( 'fast-csv' );
const xlsx = require( 'xlsx-writestream' );

const pdf = require( '@openagenda/pdf' );
const utils = require( '@openagenda/utils' );
const tabLabels = require( '@openagenda/labels' )( require( '@openagenda/labels/agenda-admin/tabs' ) );

const svcConfig = require( './config' );
const eventSvc = require( '../event' );
const config = require( '../../config' );
const version = require( './helpers/version' );

const mwh = require( '../lib/middlewareHelpers' );

let svc;

module.exports = function( agendaService ) {

  svc = agendaService;

  return {
    load: loadAgenda,
    loadAdminLayout,
    search: searchEvents,
    browserCache,
    browserCacheControlData,
    decorateEvents,
    decorateEvent,
    cleanJson,
    rss: require( './rss' ),
    buildCsv,
    buildXlsx,
    buildPdf,
    buildIcs: require( './ics' )
  }

}



/**
 * load agenda instance and set it in req.agenda
 */

function loadAgenda( paramName, fieldName, options ) {

  const loadOptions = {
    name: 'agenda',
    required: true
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
  [ 'name', 'required' ].forEach( function( k ) {

    if ( options[ k ] === undefined ) return;

    loadOptions[ k ] = options[ k ];

    delete options[ k ];

  } );

  return function( req, res, next ) {

    const getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];
    
    if ( !loadOptions.required && req.params[ paramName ] === undefined ) {

      return next();

    }

    svc.get( getParams, options, ( err, a ) => {

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

          req[ loadOptions.name ].isEmpty = !has;

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

  async.waterfall( [

    wcb => {

      req.layoutData = {
        agenda: {
          slug: req.agenda.slug,
          uid: req.agenda.uid,
          title: req.agenda.title,
          description: req.agenda.description,
          url: req.agenda.url,
          image: req.agenda.getImage ? req.agenda.getImage( false ) : req.agenda.image
        },
        bottom: {
          scriptSources: [
            '/js/verifiedLocationsCounter.js'
          ]
        }
      }

      wcb();

    },

    // define tabs to display based on credentials
    wcb => {

      _getCredentialList( req.agenda, function( err, credentials ) {

        req.log( 'loaded credentials %s', credentials );

        if ( err ) return wcb( err );

        // filter tabs where agenda does not have required creds
        req.layoutData.tabs = svcConfig.adminTabs.filter( tab => {

          // if user is moderator and tab access is not given to moderators,
          // filter.
          if ( req.access == 'moderator' && tab.access !== 'moderator' ) {

            return false;

          }

          if ( tab.requiredCred === undefined ) return true;

          if ( credentials.includes( tab.requiredCred ) ) return true;

          return !!tab.call;

        } )

        // filter out tabs not matching adequate version 
        .filter( tab => {

          if ( !tab.version ) {

            return true;

          }

          return version( tab.version.split( ':' )[ 0 ], parseInt( tab.version.split( ':' )[ 1 ] ), { agendaUid: req.agenda.uid, createdAt: req.agenda.createdAt } );

        } )

        .map( tab => {

          const label = tabLabels( tab.key, req.lang );

          let badge = null;

          if ( tab.badge ) {

            badge = _.extend( {}, tab.badge, { label: tabLabels( tab.badge.label, req.lang ) } );

          }

          if ( !credentials.includes( tab.requiredCred ) && tab.call ) {

            tab.call.agenda = req.agenda.uid;

            tab.call.lang = req.lang;

            tab.uri = '#';

          }

          return _.extend( {}, tab, {
            badge: badge || undefined,
            label,
            call: credentials.includes( tab.requiredCred ) ? null : tab.call
          } );

        } );

        wcb();

      } );

    },

  ], err => {

    next( err || undefined );

  } );

}


function _getCredentialList( agenda, cb ) {

  // legacy service function
  if ( agenda.getCredentialList ) {

    return agenda.getCredentialList( ( err, list ) => {

      cb( null, list )

    } );

  }

  // new service
  
  setImmediate( () => {

    cb( null, _.keys( _.pickBy( agenda.credentials, v => !!v ) ) );

  } );

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

  req.templateData.hasSearchQuery = !!utils.size( req.query.oaq );

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

    req.limit = Math.min( parseInt( req.query.limit ? req.query.limit : limit, 10 ), 300 ) || limit;
    req.offset = pagination.offset || ( pagination.page - 1 ) * req.limit || 0;

    req.agenda.search( req.query.oaq, {
      limit: req.limit,
      offset: req.offset,
      showAll: showAll
    }, ( err, data ) => {

      if ( err ) return next( err );

      req.events = data.events;

      req.total = data.total;

      next();

    } );

  }

}


function browserCacheControlData( req, res, next ) {

  req.agenda.getControlDataTimestamp( ( err, t ) => {

    if ( err ) next( err );

    mwh.compareModifiedSince( t, req, res, next );

  } );

}

function browserCache( req, res, next ) {

  if ( _hasQueryOtherThan( req, 'callback' ) ) {

    return next();

  }

  mwh.compareModifiedSince( req.agenda.updatedAt, req, res, next )

}


function decorateEvents( includePrivateData ) {

  return function( req, res, next ) {

    var instanciated = req.events.map( eventSvc.instanciate );

    svc.exports.decorateEvents( req.agenda, instanciated, req.formatted, {
      includePrivateData: !!includePrivateData,
      lang: req.lang
    }, next );

  }

}

function decorateEvent( includePrivateData ) {

  return function( req, res, next ) {

    svc.exports.decorateEvent( req.agenda, req.event, req.formatted, {
      // this value was at false, the custom file link needs access
      includePrivateData,
      lang: req.lang,
      loadTagSet: true,
      multiLang: false
    }, next );

  }

}

function cleanJson( req, res, next ) {

  req.formatted.forEach( f => {

    if ( f.customValues ) {

      f.custom = f.customValues;

      delete f.customValues;

      delete f.customLabels;

    }

    if ( f.references ) {

      f.linkedEvents = f.references;

      delete f.references;

    }

  } );

  next();

}

function buildPdf( req, res, next ) {

  const pdfOptions = req.agenda.getPdfOptions();

  const stream = req.agenda.searchStream( req.query.oaq, {
    showAll: false
  } );

  const pdfStream = pdf( {
    title: req.agenda.title,
    description: req.agenda.description,
    link: req.agenda.url,
    imageLink: req.agenda.image ? config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ) + req.agenda.image : false,
  }, {
    lang: req.lang,
    style: pdfOptions.style,
    showLinks: pdfOptions.showLinks
  } );

  pdfStream.getReadableStream().pipe( res );

  res.writeHead( 200, {
    'Content-Type': 'application/pdf',
    'content-disposition': [
      'attachment; filename=\"',
      req.agenda.slug,
      '.', _stringifiedNow(),
      '.pdf\"' ].join('')
  } );

  stream.on( 'data', function( eventData ) {

    req.log( 'streaming event %s for pdf export', eventData.id );

    const eInst = eventSvc.instanciate( eventData );

    stream.pause();

    eInst.exportable( { filter: req.query.oaq }, ( err, clean ) => {

      if ( err ) {

        req.log( 'error', err );

        return stream.resume();

      }

      pdfStream.write( clean );

      stream.resume();

    });

  } );

  stream.on( 'end', function() {

    req.log( 'end reached' );

    pdfStream.end();

  } );

}


function buildXlsx( includePrivateData ) {

  return function( req, res, next ) {

    req.agenda.flattener( {
      exclusiveLang: _.get( req, [ 'query', 'cols.lang' ] ),
      includePrivateData,
      lang: req.lang
    }, ( err, f ) => {

      if ( err ) return next( err );

      const stream = req.agenda.searchStream( req.query.oaq, {
        showAll: includePrivateData 
      } ),

      xlsxStream = new xlsx(),

      defaultRow = {};

      let processing = 0, end;

      // default empty values
      f.getFieldNames().forEach( n => defaultRow[ n ] = '' );

      xlsxStream.getReadStream().pipe( res );

      res.writeHead( 200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-disposition': [
          'attachment; filename=\"',
          req.agenda.slug,
          '.', _stringifiedNow(),
          '.xlsx\"' ].join('')
      } ); 

      stream.on( 'data', eventData => {

        stream.pause();

        processing++;

        // instanciate
        const eInst = eventSvc.instanciate( eventData );

        // clean event
        eInst.exportable( ( err, clean ) => {

          if ( err ) {

            req.log( 'error', err );

            return stream.resume();

          }

          // decorate with agenda related data
          svc.exports.decorateEvent( req.agenda, eInst, clean, {
            includePrivateData: !!includePrivateData,
            protocol: 'https:',
            loadTagSet: true
          }, function( err, clean ) {

            processing--;

            if ( err ) {

              req.log( 'error', err );

              return stream.resume();

            }

            xlsxStream.addRow( _cleanXlsxRow( utils.extend( {}, defaultRow, f.flatten( clean ) ) ) );

            stream.resume();

            if ( !processing && end ) {

              xlsxStream.finalize();

            }

          } );

        } );


      } );

      stream.on( 'end', function() {

        end = true;

        if ( !processing ) xlsxStream.finalize();

      });

    } );

  }

}


function buildCsv( includePrivateData ) {

  return function( req, res, next ) {

    req.agenda.flattener( {
      includeDetailedLocation: _includeDetailedLocation( req ),
      includePrivateData,
      lang: req.lang,
      exclusiveLang: _.get( req, [ 'query', 'cols.lang' ] )
    }, ( err, f ) => {

      if ( err ) return next( err );

      const stream = req.agenda.searchStream( req.query.oaq, {
        showAll: includePrivateData 
      } );

      const csvStream = csv.createWriteStream( {
        headers: true,
        delimiter: ';',
        quote: '"',
        escape: '"'
      } ),

      defaultRow = {};

      let processing = 0,

      end;

      // csv must have all column filled with empty values
      f.getFieldNames().forEach( n => {

        defaultRow[ n ] = '';

      } );

      csvStream.pipe( res );

      res.writeHead( 200, {
        'Content-Type': 'text/csv',
        'content-disposition': [
          'attachment; filename=\"',
          req.agenda.slug,
          '.', _stringifiedNow(),
          '.csv\"' ].join('')
      } ); 

      stream.on( 'data', eventData => {

        stream.pause();

        processing++;

        // instanciate
        const eInst = eventSvc.instanciate( eventData );

        eInst.exportable( { protocol: 'https:' }, ( err, clean ) => {

          // decorate with agenda related data
          svc.exports.decorateEvent( req.agenda, eInst, clean, {
            includePrivateData: !!includePrivateData,
            loadTagSet: true
          }, ( err, clean ) => {

            processing--;

            if ( err ) {

              req.log( 'error', err );

              return stream.resume();

            }

            csvStream.write( utils.extend( {}, defaultRow, f.flatten( clean ) ) );

            stream.resume();

            if ( !processing && end ) {

              csvStream.end();

            }

          } );

        } );
      } );

      stream.on( 'end', () => {

        end = true;

        if ( !processing ) csvStream.end();

      });

    } );

  }

}


function _includeDetailedLocation( req ) {

  if ( !req.locationSettings ) return true;

  if ( !req.locationSettings.admin ) return true;

  if ( req.locationSettings.admin.detailed === undefined ) return true;

  return req.locationSettings.admin.detailed;

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

  if ( typeof exceptions == 'string' ) exceptions = [ exceptions ];

  if ( !exceptions ) exceptions = [];

  for( var q in req.query ) {

    if ( exceptions.indexOf( q ) == -1 ) return true;

  }

  return false;

}


function _cleanXlsxRow( row ) {

  var clean = {};

  for( let c in row ) {

    if ( typeof row[ c ] == 'string' ) {

      clean[ c ] = row[ c ].replace( /\v/g, ' ' );

      clean[ c ] = row[ c ].replace( /\n/g, '\r\n' );

      clean[ c ] = row[ c ].replace( /\u0006/g, '' );

    } else if ( utils.isArray( row[ c ] ) ) {

      clean[ c ] = row[ c ].join( ', ' ) + '';
      
    } else {

      clean[ c ] = row[ c ] + '';
    
    }

  }

  return clean;

}


function _stringifiedNow() {

  var now = new Date();

  return _fZ( now.getMonth() + 1 ) + _fZ( now.getDate() );

}

function _fZ( n ) {

  return ( n>9 ? '' : '0' ) + n;

}