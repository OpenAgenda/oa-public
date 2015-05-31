"use strict";

var parser = require( 'tumblrParser' ),

cn = require(  '../../js/lib/common/common.mod.js' ),

config = require( './config' ),

UID = 0,

env = window.env ? window.env : 'prod',

tpl = require( './preview.tblr' ),

tplMap = JSON.parse( require( './template.map.json' ) ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

debug = require( 'debug' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

defaults = {
  uid: false, // required
  link: false, // optional. link to agenda page
  eventPart: false, // required. bit to add to link to open event
  lang: 'fr',
  useStyle: true,
  count: config.count
};

if ( cn.contains( [ 'dev', 'tpl' ], env ) ) debug.enable( '*' );

cn.addEvent( window, 'load', _init );

function widget( elem, options ) {

  var params = cn.extend( {}, defaults, options ),

  log = debug( 'preview ' + params.uid );

  if ( !params.uid ) return log( 'preview widget uid not found' );

  log( 'fetching agenda data' );

  _fetch( params.uid, function( err, data ) {

    if ( err ) return log( 'could not retrieve agenda data %s', err );

    var wTpl = _extractTemplate( tpl, elem ),

    events = _clean( data.events, { 
      lang: params.lang,
      link: params.link,
      eventPart: params.eventPart,
      count: params.count
    } ),

    renderedWidget = _render( wTpl, { events: events } );

    styler( style );

    elem.removeChild( cn.el( elem, 'a' ) );

    elem.insertAdjacentElement( 'afterbegin', renderedWidget );

  } );

}

function _render( template, data ) {

  var div = document.createElement( 'div' ),

  p = parser( tplMap );

  p.load( template );

  div.innerHTML = p.render( data );

  return div;

}

function _clean( events, options ) {

  var lang = options.lang;

  return events.slice( 0, options.count ).map( function( event ) {

    var e = cn.extend( {}, event );

    _flattenMultilinguals( event, e, lang );

    _defineEventLink( event, e, options );

    if ( e.thumbnail ) e.thumbnail = e.thumbnail.replace( 'cibuldev', 'cibul' );
    if ( e.image ) e.image = e.image.replace( 'cibuldev', 'cibul' );

    return e;

  });

}

function _extractTemplate( defaultTemplate, elem ) {

  // pick out commented section
  var startIndex = elem.innerHTML.indexOf( '<!--' ),

  endIndex = elem.innerHTML.indexOf( '-->' );

  if ( startIndex == -1 || endIndex == -1 ) {

    return defaultTemplate;

  }

  return elem.innerHTML.substr( 
    startIndex + '<!--'.length, 
    endIndex - startIndex - '<!--'.length
  );

}

function _defineEventLink( event, e, options ) {

  var link = options.link,

  eventPart = options.eventPart;

  e.link = link + eventPart.replace( '{uid}', event.uid ).replace( '{slug}', event.slug );

}


function _flattenMultilinguals( event, e, lang ) {

  cn.forEach( [ 'title', 'description', 'longDescription', 'range' ], function( field ) {
      
    for( var l in event[ field ] ) break;

    if ( typeof event[ field ][ lang ] !== 'undefined' ) {

      l = lang;

    }

    if ( l ) e[ field ] = event[ field ][ l ];

  } );

}

function _fetch( uid, cb ) {

  remote.get(
    ( config.res[ env ]  ? config.res[ env ].json : config.res.all.json ).replace( '{uid}', uid ),
    { timeout: config.timeout },
    function( responseType, data ) {

      cb( responseType === 'success' ? null : responseType, data );

    },
    env === 'tpl'
  )

}

function _filterByAttr( obj, arr ) {

  var newObj = {};

  cn.forEach( arr, function( name ) {

    if ( obj[name] !== undefined ) newObj[name] = obj[name];

  });

  return newObj;

}

function _init() {

  var res = config.res[ env ] ? config.res[ env ] : config.res.all;

  cn.forEach( cn.els( config.selector ), function( elem ) {

    var arr = elem.getAttribute( config.attributes.config ).split( '|' ),

    link = cn.el( elem, 'a' ).getAttribute( 'href' ),

    lang = elem.hasAttribute( config.attributes.lang ) ? elem.getAttribute( config.attributes.lang ) : config.defaultLang,

    count = elem.hasAttribute( config.attributes.count ) ? parseInt( elem.getAttribute( config.attributes.count ), 10 ) : 3;

    widget( elem, {
      uid: arr[ UID ],
      link: ( link ? link.replace( '{uid}', arr[ UID ] ) : res.page ),
      eventPart: link ? res.eventPart : res.embedEventPart,
      useStyle: !elem.hasAttribute( config.attributes.noDefaultStyle ),
      count: count
    } );

  } );

}