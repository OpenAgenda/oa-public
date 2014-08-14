var cn = require('../../../../js/lib/common/common.mod.js'),

lightbox = require('../../../../js/lib/lightbox/lightbox.mod.js'),

remote = require('../../../../js/lib/remote/remote.mod.js'),

params = {
  selectors: {
    trigger: '.js_lightbox_trigger'
  },
  classes: {
    disabled: 'disabled',
    lightbox: {
      frame: 'wsq lightbox-frame', 
      canvas: 'lightbox-canvas', 
      buttonBox: 'lightbox-buttons', 
      button: 'small button'
    }
  }
};

module.exports = function( options ) {

  cn.extend( params, options ? options : {} );

  cn.addEvent( window, 'load', function() {

    cn.forEach(cn.els( params.selectors.trigger ), _handleLightbox );

  });

};

var _handleLightbox = function( triggerElem ) {

  var res = triggerElem.getAttribute( 'href' ),

  loaded = false;

  cn.addEvent( triggerElem, 'click', function( e ) {

    cn.preventDefault( e );

    if ( loaded ) return;

    loaded = true;

    _disable( triggerElem );

    _loadPage( res, function( err, html ) {

      if ( err ) return _handleError( triggerElem, err );

      lightbox({
        html: html,
        buttons: false,
        classes: params.classes.lightbox,
        onOpen: _handleLightboxContent
      });

    });

  });

},


_handleLightboxContent = function( lighboxFrameElem ) {

  cn.forEach( cn.els( 'a', lightboxFrameElem ), function( aElem ) {

    cn.addEvent( aElem, 'click', function( e ) {

      cn.preventDefault( e );

      console.log( 'click!' );

    });

  });

},


/**
 * fetch partial from server
 */

_loadPage = function( res, cb ) {

  remote.getXmlHttp( res, { timeout: 10000 }, function( responseType, data) {

    if ( responseType !== 'success' ) return cb( 'unsuccessful request: ' + responseType );

    if ( !data.success ) return cb( { message: data.message } );

    cb( null, data.partial );

  });

},


/**
 * disable page lightbox buttons
 */

_disable = function( elem ) {

  cn.forEach( cn.els( params.selectors.trigger ), function( elem ) {

    cn.addClass( elem, params.classes.disabled );  

  });


},


/**
 * enable page lightbox buttons
 */

_enable = function( elem ) {

  cn.forEach( cn.els( params.selectors.trigger ), function( elem ) {

    cn.removeClass( elem, params.classes.disabled );  

  });

},


/**
 * handle error
 */

_handleError = function( elem, err ) {

  _enable( elem );

  console.log('aborting');
  console.log(err);

};

/*
  html: data.partial,
  buttons: false,
  classes: params.lightboxClasses,
  onOpen: options.onElemReady
 */