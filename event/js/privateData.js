"use strict";

var utils = require( 'utils' ),

du = require( 'dom-utils' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

debug = require( 'debug' ), log,

defaults = {
  uid: false,
  agendaUid: false,
  env: 'production',
  selector: '.js_custom',
  url: {
    prod: '/agendas/{agendaUid}/events/{eventUid}/private',
    dev: '/agendas/{agendaUid}/events/{eventUid}/private',
    tpl: '/server/testdata/privateeventdata.json'
  },
  customHead: '<div class="private-head"><i class="fa fa-lock"></i></div>',
  customTemplate: require( '../custom.part.ejs' ),
  contributorHead: '<div class="private-subhead"></div>',
  contributorTemplate: require( '../contributor.part.ejs' ),
  className: 'private'
}

module.exports = function( options ) {

  var params = utils.extend( {}, defaults, options ? options : {} );

  if ( window.env ) params.env = window.env;

  if ( [ 'dev', 'tpl' ].indexOf( params.env ) !== -1 ) {

    debug.enable( '*' );

  }

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

      if ( utils.size( data.custom ) || utils.size( data.contributor ) ) {

        du.el( params.selector ).insertAdjacentHTML( 'beforeend', params.customHead );

      }
      
      if ( utils.size( data.custom.custom ) ) {

        du.el( params.selector ).insertAdjacentHTML( 'beforeend', _renderCustom( data.custom ) );

      }

      if ( data.contributor && utils.size( data.contributor ) ) {

        du.el( params.selector ).insertAdjacentHTML( 'beforeend', _renderContributor( data.contributor ) );

      }

    });

  }

  function _fetch( res, cb ) {

    log( 'fetching %s', res );

    remote.get( res, { timeout: 30000 }, function( responseType, data ){

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

  function _renderContributor( data ) {

    return params.contributorHead + params.contributorTemplate( data );

  }

  function _renderCustom( data ) {

    data.customClass = params.className;

    return params.customTemplate( data );

  }

}