"use strict";

var du = require( '../../js/lib/domUtils' ),

utils = require( '@openagenda/utils' ),

store = require( 'store' ),

debug = require( 'debug' ), log,

qs = require( 'qs' ),

bBar = require( './bottomBar' ),

frLabels = require( './favorites.fr.json' ),

i18n = require( '../../layout/js/i18n' ), __,

params = {
  lang: 'fr',
  agendaUid: false, // required
  bottomBar: true, // use bottom bar
  classes: {
    displayNone: 'display-none'
  },
  selectors: {
    item: '.js_fav_item',
    exports: '.js_fav_export',
    info: '.js_fav_info',
    clear: '.js_fav_clear'
  },
  attributes: {
    uid: 'data-event-uid'
  },
  storeKey: 'favorites',
  templates: {
    favorited: '<i class="fa fa-star active"></i>',
    unfavorited: '<i class="fa fa-star-o"></i>'
  },
  res: {
    share: '#' // required
  }
},

favUids;

module.exports = {
  init: init,
  sweep: sweep
}

if ( [ 'tpl', 'development' ].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}


function init( options ) {

  utils.extend( params, options );

  favUids = _getFavUids();

  __ = i18n( params.lang == 'fr' ? frLabels: {} );

  log = debug( 'favorites' );

  refreshBottomBar(favUids);
}


function refreshBottomBar(favUids) {
  if (!params.bottomBar) {
    return;
  }

  if (!favUids.length) {
    bBar.hide();
    return;
  }

  const share = params.res.share + '&' + favUids.map(uid => `oaq[uids][]=${uid}`).join('&');

  bBar.setContent(
    __( 'You have now %count% events in your favorites', { '%count%' : favUids.length } ) 
    + ' - <a href="' + share + '">' + __( 'export' ) + '</a>'
    + ' - <a class="js_fav_clear">' + __( 'clear' ) + '</a>' 
  );

  bBar.show();

  _eventifyClear();
}


/**
 * go through displayed event items
 */

function sweep( ignoreFlagged ) {

  log( 'sweeping %s', ignoreFlagged ? 'forced' : '' );

  utils.forEach( du.els( params.selectors.item ), function( favElem ) {

    if ( favElem.hasAttribute( 'data-fav-flagged' ) && !ignoreFlagged ) return;

    favElem.setAttribute( 'data-fav-flagged', 1 );

    var uid = parseInt( favElem.getAttribute( params.attributes.uid ), 10 ),

    isFaved = favUids.indexOf( uid ) !== -1;


    ( isFaved ? _setFavorited : _setUnfavorited )( favElem );

    du.addEvent( favElem, 'click', function( e ) {

      e.preventDefault();
      e.stopPropagation();

      isFaved = !isFaved;

      ( isFaved ? _setFavorited : _setUnfavorited )( favElem );

      if ( isFaved ) {

        favUids.push( uid );

      } else {

        favUids.splice( favUids.indexOf( uid ), 1 );

      }

      _saveFavUids( favUids );

      refreshBottomBar(favUids);
    } );

  } );

}


/**
 * give behavior to clear link. Should be only one ine the page
 */

function _eventifyClear( cb ) {

  var elem = du.el( params.selectors.clear );

  if ( !elem ) return;

  du.addEvent( elem, 'click', function( e ) {

    du.preventDefault( e );

    favUids = [];

    _saveFavUids( favUids );

    sweep( true );

    if ( params.bottomBar ) {

      bBar.hide();

    }

  });

}


function _createItem() {

  var item = document.createElement( 'div' );

  item.innerHTML = params.templates.item;

  return du.childObject( item, 0 );

}

function _setUnfavorited( item ) {

  item.innerHTML = params.templates.unfavorited;

}

function _setFavorited( item ) {

  item.innerHTML = params.templates.favorited;

}

function _saveFavUids( uids ) {

  var v = JSON.parse( store.get( params.storeKey ) || '{}' );

  v[ params.agendaUid ] = uids;

  store.set( params.storeKey, JSON.stringify( v ) );

}

function _getFavUids() {

  var v =  JSON.parse( store.get( params.storeKey ) || '{}' );

  return v[ params.agendaUid ] || [];

}