"use strict";
"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

debug = require( 'debug' ), log,

EJS = require( '../../js/lib/clientEjs/ejs' ),

defaults = {
  uid: false,
  agendaUid: false,
  env: 'prod',
  selector: '.js_custom',
  url: {
    prod: '/agendas/{agendaUid}/events/{eventUid}/custom/private',
    dev: '/agendas/{agendaUid}/events/{eventUid}/custom/private',
    tpl: '/server/testdata/privateeventcustomdata.json'
  },
  template: require( '../custom.part.ejs' ),
  className: 'private'
}

module.exports = function( options ) {

  var params = cn.extend( {}, defaults, options ? options : {} );

  if ( window.env ) params.env = window.env;

  if ( cn.contains( [ 'dev', 'tpl' ], params.env ) ) debug.enable( '*' );

  log = debug( 'customData' );

  return {
    load: load
  }

  function load( agendaUid, eventUid ) {

    var res = _defineRes( agendaUid, eventUid );

    _fetch( res, function( err, data ) {

      if ( err ) {

        log( 'error', err );

        return;

      }

      var elem = _render( data );

      cn.el( params.selector ).appendChild( elem );

    });

  }

  function _fetch( res, cb ) {

    log( 'fetching %s', res );

    remote.get( res, {}, function( responseType, data ){

      if ( responseType == 'success' ) {

        cb( null, data );

      } else {

        cb( data.responseType );

      }

    }, true );

  }

  function _defineRes( agendaUid, eventUid ) {

    var res = params.url[ params.env ];

    res = res.replace( '{eventUid}', eventUid )
       .replace( '{agendaUid}', agendaUid );

    return res;

  }

  function _render( data, cb ) {

    var elem = document.createElement( 'div' );

    data.customClass = params.className;

    elem.innerHTML = new EJS( { 
      text: params.template
    } ).render( data );

    return elem.childNodes[ 0 ];

  }

}