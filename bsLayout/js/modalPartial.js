"use strict";

var cn = require('../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

debug = require( 'debug' ), log,

defaults = {
  classes: {
    displayNone: 'display-none'
  },
  selectors: {
    close: '.js_close_popup',
    inner: '.js_popup_content'
  }
};

module.exports = function( linkElem, options ) {

  var params = cn.extend( {}, defaults, options ? options : {} ),

  modalElem = false, // know if needs to be loaded or not

  log = debug( 'modalPartial' ),

  innerClick = false;

  cn.addEvent( linkElem, 'click', function( e ) {

    cn.preventDefault( e );

    if ( !modalElem ) { 

      _fetchAndCreate( _display );

    } else {

      _display();

    }

  });

  function _fetchAndCreate( onComplete ) {


    ( window.env == 'tpl' ? _rawGetter : _jsonGetter )( linkElem.getAttribute( 'href' ), function( err, data ) {

      if ( err ) {

        log( 'ran into some trouble: %s', err );

        return;

      }

      modalElem = document.createElement( 'div' );

      modalElem.innerHTML = data;

      cn.addEvent( cn.el( modalElem, params.selectors.inner ), 'click', function() {

        _flagInnerClick();

      } );

      cn.addEvent( cn.el( modalElem, params.selectors.close ), 'click', function() {

        _close();

      });

      _close();

      cn.el( 'body' ).appendChild( modalElem );

      onComplete();

    }, true );

  }

  function _display() {

    cn.removeClass( modalElem, params.classes.displayNone );

  }

  function _close() {

    if ( innerClick ) return;

    cn.addClass( modalElem, params.classes.displayNone );

  }

  function _flagInnerClick() {

    innerClick = true;

    setTimeout( function() { innerClick = false; }, 10 );

  }

}


function _jsonGetter( res, cb ) {

  remote.get( res, {}, function( responseType, data ) {

    if ( responseType !== 'success' ) {

      return cb( 'unsuccessful get: %s', responseType );

    }

    if ( data.success !== true ) {

      return cb( 'unsuccessful get: %s', JSON.stringify( data ) );

    }

    cb( null, data.partial );

  }, true );

}

function _rawGetter( res, cb ) {

  remote.get( res, { raw: true }, function( responseType, data ) {

    if ( responseType !== 'success' ) {

      return cb( 'unsuccessful get: %s', responseType );

    }

    cb( null, data );

  }, true );

}