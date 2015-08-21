"use strict";

var svc,

parserLib = require( 'tumblrParser' ),

fs = require( 'fs' ),

async = require( 'async' ),

utils = require( '../../lib/utils' ),

mwh = require( '../lib/middlewareHelpers' ),

tblr = {
  eventItem: fs.readFileSync( __dirname + '/templates/eventItem.tblr' ).toString(),
  eventItemMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/eventItem.map.json' ).toString() ),
  event: fs.readFileSync( __dirname + '/templates/event.tblr' ).toString(),
  eventMapping: JSON.parse( fs.readFileSync( __dirname + '/templates/event.map.json' ).toString() )
};

module.exports = function( embedService ) {

  svc = embedService;

  return {
    load: loadEmbed,
    loadCustomLayoutData: loadCustomLayoutData,
    renderEventItems: renderEventItems,
    renderEvent: renderEvent,
    browserCache: browserCache,
    browserCacheControlData: browserCacheControlData
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

    template = req.embed.getTemplate( 'eventitem' ) || template;

  }

  if ( !req.renders ) req.renders = {};

  req.renders.eventItems = [];

  var eventItemParser = parserLib( mapping );

  eventItemParser.load( template );

  async.each( req.events, function( e, ecb ) {

    _getCustomFields( req, e, 'eventitem', function( err, values ) {

      if ( err ) return ecb( err );

      req.renders.eventItems.push( eventItemParser.render( utils.extend( e, values ) ) );


      ecb();

    });

  }, next );

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

  _getCustomFields( req, req.event, 'event', function( err, values ) {

    if ( err ) return next( err );

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

      if ( err ) return next( { code: 404, message: 'embed configuration not found' } );

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

  e.getCustomFields( req.lang, true, cb );

}