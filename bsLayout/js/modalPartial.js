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
  },
  attributes: {
    flag: 'data-flagged',
    modal: 'data-modal' // if content has links to be opened in modals, selector class is specified here.
  }
};

module.exports = processItem;

module.exports.multiple = multiple;


function multiple( linkElems, options ) {

  var params = cn.extend( {}, defaults, options ? options : {} );

  cn.forEach( linkElems, function( linkElem ) {

    if ( linkElem.hasAttribute( params.attributes.flag ) ) return;

    linkElem.setAttribute( params.attributes.flag, 1 );

    processItem( linkElem, params );

  } );

}


function processItem( linkElem, options ) {

  var params = cn.extend( {}, defaults, options ? options : {} ),

  modalElem = false, // know if needs to be loaded or not

  log = debug( 'modalPartial' ),

  innerClick = false;

  if ( !cn.isElement( linkElem ) ) {

    if ( cn.isArray( linkElem ) && linkElem.length && cn.isElement( linkElem[ 0 ] ) ) {

      multiple( linkElem, options );

    } else {

      log( 'invalid arguments' );

    }

    return;

  }

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

      _processSubmodals( modalElem, _close );

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


function _processSubmodals( elem, close ) {

  var child = cn.childObject( elem, 0 );

  if ( !child ) return;

  if ( child.hasAttribute( defaults.attributes.modal ) ) {

    cn.forEach( cn.els( child, '.' + child.getAttribute( defaults.attributes.modal ) ), function( submodalTrigger ) {

      processItem( submodalTrigger );

      // close parent modal to prevent pileup
      cn.addEvent( submodalTrigger, 'click', function( e ) {

        close();

      });

    });


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