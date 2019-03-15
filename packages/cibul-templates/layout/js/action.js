var lightbox = require( '../../js/lib/lightbox/lightbox.mod.js' ),

  cn = require( '../../js/lib/common/common.mod.js' ),

  remote = require( '../../js/lib/remote/remote.mod.js' ),

  debug = require( 'debug' ),

  log = debug( 'action' ),

  defaults = {
    onResponse: false,  // type, data
    onElemReady: false,  // form
    loadLightbox: false,
    errorLightbox: false
  },

  params = {
    lightboxClasses: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas',
      buttonBox: 'lightbox-buttons',
      body: 'noscroll'
    },
    debug: false
  };

exports.init = function ( options ) {

  cn.extend( params, typeof options == 'undefined' ? {} : options );

};

exports.get = function get( res, options ) {

  log( 'processing get on %s', res );

  if ( typeof options == 'undefined' ) options = {};

  var reqParams = options.data ? options.data : {};

  options = cn.extend( {}, defaults, options );

  request( res, reqParams, function ( responseType, data ) {

    log( 'get response received: %s', responseType );

    if ( responseType !== 'success' ) {

      if ( options.onResponse ) options.onResponse( responseType );

      return;

    }

    if ( (data.success === false) && data.message && options.errorLightbox ) lightbox( {
      message: data.message,
      classes: params.lightboxClasses
    } );

    if ( data.partial && options.loadLightbox ) {

      lightbox( {
        html: data.partial,
        buttons: false,
        classes: params.lightboxClasses,
        onOpen: options.onElemReady
      } );

    }

    if ( data.partial && !options.loadLightbox ) {

      log( 'TODO: partial is loaded not to be used for lightbox' );

    }

    if ( data.redirect ) get( data.redirect, options );

    if ( options.onResponse ) options.onResponse( responseType, data );

  } );

};

var request = function ( res, reqParams, callback ) {

  if ( params.debug ) reqParams.format = 'jsonp';

  remote.get( res, { data: reqParams, timeout: 10000, retries: 1 }, callback, !params.debug );

};
