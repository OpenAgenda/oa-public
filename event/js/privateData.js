"use strict";

var _ = {
  extend: require( 'lodash/extend' ),
  keys: require( 'lodash/keys' )
},

  du = require( '@openagenda/dom-utils' ),

  activities = require( './activities' ),

  displayContributor = require( './contributor' ),

  remote = require( '../../js/lib/remote/remote.mod.js' ),

  debug = require( 'debug' ), log,

  defaults = {
    uid: false,
    agendaUid: false,
    env: 'production',
    selector: '.js_custom',
    url: {
      production: '/agendas/{agendaUid}/events/{eventUid}/private',
      development: '/agendas/{agendaUid}/events/{eventUid}/private',
      tpl: '/server/testdata/privateeventdata.json'
    },
    activitiesSelector: '.js_activities',
    contributorsSelector: '.js_contributor',
    activitiesUrl: {
      production: '/agendas/{agendaUid}/events/{eventUid}/activities',
      development: '/agendas/{agendaUid}/events/{eventUid}/activities',
      tpl: '/server/testdata/eventactivitiesdata.json'
    },
    customTemplate: require( '../custom.part.ejs' ),
    className: 'private'
  }

module.exports = function( options ) {

  var params = _.extend( {}, defaults, options ? options : {} );

  if ( window.env ) params.env = window.env;

  if ( [ 'development', 'tpl' ].indexOf( params.env ) !== -1 ) {

    debug.enable( '*' );

  }

  log = debug( 'customData' );

  return {
    load: load,
    activities: displayActivities,
    inbox
  }

  function load( agendaUid, eventUid ) {

    var res = _defineRes( agendaUid, eventUid );

    _fetch( res, function( err, data ) {

      if ( err ) {

        log( 'error', err );

        return;

      }

      if ( _.keys( data.custom.custom ).length ) {

        du.el( params.selector ).insertAdjacentHTML( 'beforeend', _renderCustom( data.custom ) );

      }

      if ( data.contributor && _.keys( data.contributor ).length ) {

        displayContributor( {
          contributor: data.contributor,
          canvas: du.el( params.contributorsSelector )
        } );

      }

    });

  }

  function displayActivities( agendaUid, eventUid, lang ) {

    activities( {
      canvas: du.el( params.activitiesSelector ),
      res: params.activitiesUrl[ params.env ].replace( '{agendaUid}', agendaUid ).replace( '{eventUid}', eventUid ),
      fetch: _fetch,
      lang
    } );

  }

  function inbox() {
    //
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

    data.private = '<div class="private-label"><i class="fa fa-unlock-alt"></i> <span>Information privée</span></div>';

    return params.customTemplate( data );

  }

}