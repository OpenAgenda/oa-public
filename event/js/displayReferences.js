"use strict";

/**
 * display references to other events
 */

var utils = require( 'utils' ),

du = require( 'dom-utils' ),

get = require( 'utils/get' ),

defaults = {
  env: 'production',
  selector: '.js_references',
  url: {
    prod: '/agendas/{agendaUid}/events/{eventUid}/references',
    dev: '/agendas/{agendaUid}/events/{eventUid}/references',
    tpl: '/server/testdata/references.json'
  }
};

module.exports = function( agendaUid, eventUid ) {

  var params = utils.extend( {}, defaults, {
    env: window.env || defaults.env
  } );

  get(

    params.url[ params.env ]
    .replace( '{agendaUid}', agendaUid )
    .replace( '{eventUid}', eventUid ),

    function( err, response ) {

      if ( err ) return console.error( err );

      if ( !response.references ) return;

      du.el( params.selector ).insertAdjacentHTML( 'beforeend', response.references );
      
    }

  )

}