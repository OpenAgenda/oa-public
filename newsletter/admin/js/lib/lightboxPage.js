/**
 * loads resource in a lightbox and takes over all links of rendered lightbox content to make ajax calls
 */

var cn = require('../../../../js/lib/common/common.mod.js'),

lightbox = require('../../../../js/lib/lightbox/lightbox.mod.js'),

remote = require('../../../../js/lib/remote/remote.mod.js'),

formSerialize = require('form-serialize'),

params = {
  selectors: {
    trigger: '.js_lightbox_trigger'
  },
  classes: {
    disabled: 'disabled',
    lightbox: {
      frame: 'wsq lightbox-frame w500', 
      canvas: 'lightbox-canvas', 
      buttonBox: 'lightbox-buttons', 
      button: 'small button'
    }
  }
};

module.exports = function( options, cbs ) {

  cn.extend( params, options ? options : {} );

  cn.addEvent( window, 'load', function() {

    cn.forEach( cn.els( params.selectors.trigger ), function( aElem ) {

      _handleLightbox( aElem, cbs );

    } );

  });

};

var _handleLightbox = function( triggerElem, cbs ) {

  var res, data = {}, form;

  if ( triggerElem.tagName == 'FORM' ) {

    form = triggerElem;

    triggerElem = cn.el( form, 'button' );

    res = form.getAttribute( 'action' );

  } else {

    res = triggerElem.getAttribute( 'href' );

  }

  cn.addEvent( triggerElem, 'click', function( e ) {

    cn.preventDefault( e );

    if ( _isDisabled( triggerElem ) ) return;

    _disable( triggerElem ); // disables triggering elem

    if ( form ) {

      data = formSerialize( form, { hash: true } );

    }

    _loadPage( res, data, function( err, html ) {

      if ( err ) return _handleError( triggerElem, err );

      lightbox({
        html: html,
        buttons: false,
        classes: params.classes.lightbox,
        onOpen: function( frameElem ) {

          _enable( triggerElem );

          _handleLightboxContent( frameElem, cbs );
          
        },
        onHide: function() {

          cbs.onClose();

          _enable( triggerElem );

        }
      });

    });

  });

},


_handleLightboxContent = function( lightboxFrameElem, cbs ) {

  cn.forEach( cn.els( lightboxFrameElem, 'a' ), function( aElem ) {

    _handleLightbox( aElem, cbs );

  } );

  var formElem = cn.el( lightboxFrameElem, 'form' );

  if ( formElem ) _handleLightbox( formElem, cbs );

},


/**
 * fetch partial from server
 */

_loadPage = function( res, data, cb ) {

  remote.getXmlHttp( res, { timeout: 10000, data: data }, function( responseType, data) {

    if ( responseType !== 'success' ) return cb( 'unsuccessful request: ' + responseType );

    if ( !data.success ) return cb( { message: data.message } );

    cb( null, data.partial );

  });

},


/**
 * disable page lightbox buttons
 */

_disable = function( elem ) {

  cn.addClass( elem, params.classes.disabled );

},

_isDisabled = function( elem ) {

  return cn.hasClass( elem, params.classes.disabled );

}


/**
 * enable page lightbox buttons
 */

_enable = function( elem ) {

  cn.removeClass( elem, params.classes.disabled ); 

},


/**
 * handle error
 */

_handleError = function( elem, err ) {

  _enable( );

  console.log('aborting');
  console.log(err);

};