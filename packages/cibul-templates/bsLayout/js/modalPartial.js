"use strict";

var deepExtend = require( 'deep-extend' ),

remote = require( '../../js/lib/remote' ),

utils = require( '@openagenda/utils' ),

domUtils = require( '../../js/lib/domUtils' ),

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

  var params = deepExtend( {}, defaults, options ? options : {} );

  domUtils.forEach( linkElems, function( linkElem ) {

    if ( linkElem.hasAttribute( params.attributes.flag ) ) return;

    linkElem.setAttribute( params.attributes.flag, 1 );

    processItem( linkElem, params );

  } );

}


function processItem( linkElem, options ) {

  var params = deepExtend( {}, defaults, options ? options : {} ),

  modalElem = false, // know if needs to be loaded or not

  log = debug( 'modalPartial' ),

  innerClick = false;

  if ( !domUtils.isElement( linkElem ) ) {

    if ( utils.isArray( linkElem ) && linkElem.length && domUtils.isElement( linkElem[ 0 ] ) ) {

      multiple( linkElem, options );

    } else {

      log( 'invalid arguments' );

    }

    return;

  }

  domUtils.addEvent( linkElem, 'click', function( e ) {

    domUtils.preventDefault( e );

    if ( !modalElem ) {

      if ( params.html ) {

        _generateElemFromHTML( _display );

      } else {

        _fetchAndCreate( _display );

      }

    } else {

      _display();

    }

  });


  /**
   * use html given in options as content of modal elem
   */

  function _generateElemFromHTML( onComplete ) {

    _initModal( params.html, onComplete );

  }

  function _fetchAndCreate( onComplete ) {

    ( window.env == 'tpl' ? _rawGetter : _jsonGetter )( linkElem.getAttribute( 'href' ), function( err, data ) {

      if ( err ) {

        log( 'ran into some trouble: %s', err );

        return;

      }

      _initModal( data, onComplete );

    }, true );

  }

  function _initModal( html, cb ) {

    modalElem = document.createElement( 'div' );

    modalElem.innerHTML = html;

    domUtils.addEvent( domUtils.el( modalElem, params.selectors.inner ), 'click', function() {

      _flagInnerClick();

    } );

    domUtils.addEvent( domUtils.el( modalElem, params.selectors.close ), 'click', function() {

      _close();

    });

    _close();

    domUtils.el( 'body' ).appendChild( modalElem );

    _processSubmodals( modalElem, _close );

    cb();

  }

  function _display() {

    domUtils.removeClass( modalElem, params.classes.displayNone );

  }

  function _close() {

    if ( innerClick ) return;

    domUtils.addClass( modalElem, params.classes.displayNone );

  }

  function _flagInnerClick() {

    innerClick = true;

    setTimeout( function() { innerClick = false; }, 10 );

  }

}


function _processSubmodals( elem, close ) {

  var child = domUtils.childObject( elem, 0 );

  if ( !child ) return;

  if ( child.hasAttribute( defaults.attributes.modal ) ) {

    domUtils.forEach( domUtils.els( child, '.' + child.getAttribute( defaults.attributes.modal ) ), function( submodalTrigger ) {

      processItem( submodalTrigger );

      // close parent modal to prevent pileup
      domUtils.addEvent( submodalTrigger, 'click', function( e ) {

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
