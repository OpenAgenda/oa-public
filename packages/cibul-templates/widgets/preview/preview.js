"use strict";

var domain = require( '../../domain' );

var parser = require( '@openagenda/tumblr-parser' ),

cn = require(  '../../js/lib/common/common.mod.js' ),

config = require( './config' ),

UID = 0, LANG = 1,

env = window.env ? window.env : 'production',

tpl = require( './preview.tblr' ),

tplMap = require( './template.map.json' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

debug = require( 'debug' ),

style = require( './style.css' ),

styler = require( '../lib/widgetStyler' ),

defaults = {
  uid: false, // required
  json: false, // required
  link: false, // optional. link to agenda page
  eventPart: false, // required. bit to add to link to open event
  lang: 'fr',
  useStyle: true,
  count: config.count
};

if ( cn.contains( [ 'development', 'tpl' ], env ) ) debug.enable( '*' );

cn.addEvent( window, 'load', _init );

function widget( elem, options ) {

  var params = cn.extend( {}, defaults, options ),

  log = debug( 'preview ' + params.uid );

  if ( !params.uid ) return log( 'preview widget uid not found' );
  if ( !params.uid ) return log( 'preview widget resource ( json ) not found' );

  log( 'fetching agenda data' );

  _fetch( params.json, function( err, data ) {

    if ( err ) return log( 'could not retrieve agenda data %s', err );

    var wTpl = _extractTemplate( tpl, elem ),

    events = _clean( data.events, {
      lang: params.lang,
      link: params.link,
      eventPart: params.eventPart,
      count: params.count
    } );

    if ( !events.length ) return log( 'there are no upcoming events' );

    styler( style );

    elem.innerHTML = '';

    elem.insertAdjacentElement( 'afterbegin', _render( wTpl, { events: events, total: data.total } ) );

    if ( window.oa && window.oa.onWidgetReady ) {

      window.oa.onWidgetReady( 'preview', { uid: params.uid } );

    }

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
  )
    .replace( 'src="/{', 'src="{' )
    .replace( 'href="/{', 'href="{' );

}

function _defineEventLink( event, e, options ) {

  var link = options.link,

  eventPart = options.eventPart;

  e.link = link + eventPart.replace( '{uid}', event.uid );

}


function _flattenMultilinguals( event, e, lang ) {

  cn.forEach( [ 'title', 'description', 'longDescription', 'range' ], function( field ) {

    var l = false;

    for( l in event[ field ] ) break;

    if ( event[ field] && typeof event[ field ][ lang ] !== 'undefined' ) {

      l = lang;

    }

    if ( l ) e[ field ] = event[ field ][ l ];

  } );

}

function _fetch( res, cb ) {

  remote.get( res, { timeout: config.timeout }, function( responseType, data ) {

    cb( responseType === 'success' ? null : responseType, data );

  }, env === 'tpl' )

}

function _filterByAttr( obj, arr ) {

  var newObj = {};

  cn.forEach( arr, function( name ) {

    if ( obj[name] !== undefined ) newObj[name] = obj[name];

  });

  return newObj;

}

function _init() {

  var res = config.res[ env ] ? config.res[ env ] : config.res.all,

  found = false,

  _process = function( elem ) {

    found = true;

    if ( elem.getAttribute( 'data-flag' ) ) return log( 'already referenced' );

    elem.setAttribute( 'data-flag', '1' );

    var arr = elem.getAttribute( config.attributes.config ).split( '|' ),

    lang = elem.hasAttribute( config.attributes.lang ) ? elem.getAttribute( config.attributes.lang ) : config.defaultLang,

    count = elem.hasAttribute( config.attributes.count ) ? parseInt( elem.getAttribute( config.attributes.count ), 10 ) : 3,

    link = cn.el( elem, 'a' ).getAttribute( 'href' ),

    json = ( config.res[ env ]  ? config.res[ env ].json : config.res.all.json ).replace( '{uid}', arr[ UID ] );

    if ( arr.length === 2 ) lang = arr[ LANG ].toLowerCase();

    if ( !link ) {

      throw 'href link is missing in oa preview widget body ( first <a> tag in widget body should have an href attribute. Check that your page html is valid )';

    }

    if ( elem.hasAttribute( config.attributes.json ) ) {

      json = elem.getAttribute( config.attributes.json )

    }

    widget( elem, {
      uid: arr[ UID ],
      link: link,
      lang: lang,
      json: json,
      eventPart: link.indexOf( domain ) !== -1 ? res.eventPart : res.embedEventPart,
      useStyle: !elem.hasAttribute( config.attributes.noDefaultStyle ),
      count: count
    } );

  }

  cn.forEach( cn.els( config.selector ), _process );

  if ( found ) return;

  cn.forEach( document.querySelectorAll( config.backupSelector ), function( elem ) {

    cn.addClass( elem, config.backupClasses );

    _process( elem );

  } );

}
