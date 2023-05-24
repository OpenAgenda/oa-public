"use strict";

var svc,

parserLib = require( '@openagenda/tumblr-parser' ),

fs = require( 'fs' ),

async = require( 'async' ),

utils = require( '../../lib/utils' ),

mwh = require( '../lib/middlewareHelpers' ),

tblr = {
  eventItem: fs.readFileSync( __dirname + '/templates/eventItem.tblr' ).toString(),
  eventItemMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/eventItem.map.json' ).toString() ),
  event: fs.readFileSync( __dirname + '/templates/event.tblr' ).toString(),
  eventMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/event.map.json' ).toString() ),
  header: fs.readFileSync( __dirname + '/templates/header.tblr' ).toString(),
  headerMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/header.map.json' ).toString() )
};

module.exports = function( embedService ) {

  svc = embedService;

  return {
    load : loadEmbed,
    loadCustomLayoutData,
    renderHeader,
    renderEventItems,
    renderEvent,
    browserCache,
    browserCacheControlData
  }

}


/**
 * render content of embed list,
 * shove result in req.embed.renders.list
 */

function renderEventItems( req, res, next ) {

  var template = tblr.eventItem, mapping = tblr.eventItemMapping;

  if ( req.embed ) {

    mapping = req.embed.getMapping( 'eventitem' ) || mapping;

    template = req.embed.getTemplate( 'eventitem' ) || template;

  }

  if ( !req.renders ) req.renders = {};

  req.renders.eventItems = [];

  var eventItemParser = parserLib( mapping );

  eventItemParser.load( template );

  async.eachSeries( req.events, function( e, ecb ) {

    _getCustomFields( req, e, 'eventitem', function( err, values ) {

      if ( err ) {

        req.log.error( 'could not retrieve custom data of event %s: %s', e.id, err );

      } else {

        req.renders.eventItems.push( eventItemParser.render( utils.extend( e, values ) ) );

      }

      ecb();

    });

  }, next );

}


function renderHeader( req, res, next ) {

  var mapping = tblr.headerMapping,

  template = tblr.header,

  parser;

  if ( req.embed ) {

    mapping = req.embed.getMapping( 'header' ) || mapping;

    template = req.embed.getTemplate( 'header' ) || template;

  }

  parser = parserLib( mapping );

  parser.load( template );

  req.renders.header = parser.render( {
    actionLink: req.actionLink.url,
    actionLabel: req.actionLink.label,
    lang: req.lang
  } );

  next();

}


function renderEvent( req, res, next ) {

  var mapping = tblr.eventMapping,

  template = tblr.event,

  eventParser,

  shareOptions = false;

  if ( req.embed ) {

    mapping = req.embed.getMapping( 'event' ) || mapping;

    template = req.embed.getTemplate( 'event' ) || template;

    _setActiveShares( req.formatted, req.embed );

  }

  eventParser = parserLib( mapping );

  eventParser.load( template );

  _getCustomFields( req, req.event, 'event', ( err, values ) => {

    if ( err ) return next( err );

    _flattenArrays( values );

    utils.extend( req.formatted, values );

    req.render = eventParser.render( req.formatted );

    next();

  } );

}


function loadEmbed( paramName, fieldName ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, function( err, e ) {

      if ( err ) {

        return next( {
          code: 404,
          message: 'embed configuration not found for embed ' + req.params[ paramName ]
        } );

      }

      req.embed = e;

      next();

    } );

  }

}



function loadCustomLayoutData( req, res, next ) {

  var customCss = req.embed.getCustomCss(),

  linkCss = req.embed.getLinkCss(),

  useDefaultCss = req.embed.getUseDefaultCss(),

  layoutMode = req.embed.getLayoutMode(),

  modes = {
    standard: 'oae.css',
    tiled: 'oaet.css',
    cascading: 'oaet.css',
    nocss: false
  };

  if ( !useDefaultCss.list || layoutMode == 'nocss' ) {

    delete req.baseData.head.css.main;

  }

  req.baseData.layoutMode = layoutMode;

  if ( linkCss ) {

    req.baseData.head.css.embedLink = linkCss;

  }

  if ( customCss ) {

    req.baseData.customCss = customCss;

  }

  req.baseData.head.customHead = req.embed.getHead();

  if ( layoutMode === false ) {

    req.baseData.scriptParams.cascading = req.embed.getCascadingMode();

  } else {

    req.baseData.scriptParams.cascading = layoutMode === 'cascading';

  }

  if ( modes[ layoutMode ] ) {

    req.baseData.head.css.main = '/css/' + modes[ layoutMode ];

  }

  next();

}


function browserCacheControlData( req, res, next ) {

  req.agenda.getControlDataTimestamp( function( err, lastUpdate ) {

    if ( err ) return next( err );

    if ( req.embed.updatedAt > lastUpdate ) {

      lastUpdate = req.embedUpdatedAt;

    }

    mwh.compareModifiedSince( lastUpdate, req, res, next );

  });

}


function browserCache( req, res, next ) {

  var lastUpdate = req.agenda.updatedAt;

  if ( req.embed.updatedAt > lastUpdate ) {

    lastUpdate = req.embed.updatedAt;

  }

  if ( _hasQueryOtherThan( req, 'callback' ) ) {

    return next();

  }

  mwh.compareModifiedSince( lastUpdate, req, res, next );

}


function _setActiveShares( formatted, embed ) {

  var map = {
    fb: 'facebookShare',
    tw: 'twitterShare',
    gp: 'googleShare',
    li: 'linkedInShare',
    tu: 'tumblrShare',
    pi: 'pinterestShare'
  },

  shares = embed.getShares();

  for ( var i in map ) {

    if ( !shares[ i ] ) {

      formatted[ map[ i ] ] = false;

    }

  }

}

function _hasQueryOtherThan( req, exceptions ) {

  if ( typeof exceptions == 'string' ) exceptions = [ exceptions ];

  if ( !exceptions ) exceptions = [];

  for( var q in req.query ) {

    if ( exceptions.indexOf( q ) == -1 ) return true;

  }

  return false;

}

function _getCustomFields( req, e, mapping, cb ) {

  if ( !req.embed || !req.embed.getMapping( mapping ) ) return cb( null, {} );

  if ( !req.agenda ) return cb( null, {} );


  // this call works for unconfigured custom fields. Used by MCC 2015 agendas. Need to be
  // deprecated to use getEventPublicCustomData only ( or any single source of structured event data )

  e.getCustomFields( req.lang, false, ( err, eventCustomFields ) => {

    if ( err ) return cb( err );

    req.agenda.getEventPublicCustomData( e, req.lang, ( err, custom ) => {

      if ( err ) return cb( err );

      custom.forEach( ( c ) => {

        eventCustomFields[ c.name ] = c.label;

      } );

      cb( null, eventCustomFields );

    } );

  } );

}


function _flattenArrays( values ) {

  for ( var k in values ) {

    if ( utils.isArray( values[ k ] ) ) values[ k ] = values[ k ].join( ', ' );

  }

}
