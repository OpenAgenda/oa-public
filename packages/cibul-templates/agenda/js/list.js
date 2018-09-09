"use strict";

const du = require( '@openagenda/dom-utils' );

const _ = {
  assign: require( 'lodash/assign'
}

var debug = require( 'debug' ), log,

pagination = require( './pagination' ),

partialLoader = require( './partialLoader' ),

config = require( './config' ),

params = {
  empty: false,                 // true if agenda is empty
  total: false,                 // total items
  perPager: false,              // items per page
  onLoad: false,
  selectors: {
    list: '.js_list_content'
  },
  autoLoadNext: true,
  onLastPage: false
},

loader, pagination;

module.exports = {
  init: init,
  reset: reset,
  loadNext: loadNext
}


function init( options ) {

  log = debug( 'agenda list' );

  log( 'initing' );
  
  _.assign( params, options );

  if ( options.empty ) return;

  du.asapReady( params.selectors.list, () => {

    loader = partialLoader( _.assign( config.partialOptions, {
      canvas: du.el( params.selectors.list ),
      onLoad: params.onLoad
    }));

    pagination.init( {
      href: window.location.href,
      total: params.total,
      perPage: params.perPage,
      loadNext: loader.after,
      loadPrev: loader.before,
      auto: params.autoLoadNext,
      onLastPage: params.onLastPage 
    } );

  } );

}

function loadNext( cb ) {

  log( 'load next' );

  pagination.loadNext( cb );

}

function reset( newHref ) {

  loader.replace( newHref, function( err, data ) {

    if ( err ) {

      console.log( err );

      return;

    }

    pagination.reset( newHref, data.total );

  });

}
