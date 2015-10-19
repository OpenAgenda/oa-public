"use strict";

var du = require( '../../js/lib/domUtils' ),

utils = require( 'utils' ),

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
    menu: '.js_favorite_menu',
    exports: '.js_fav_export',
    info: '.js_fav_info',
    clear: '.js_fav_clear',
    empty: '.js_favorite_menu_empty'
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
    actions: '#' // required
  }
},

favUids;

module.exports = {
  init: init,
  sweep: sweep,
  menu: menu
}

if ( [ 'tpl', 'dev' ].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}


function init( options ) {

  utils.extend( params, options );

  favUids = _getFavUids();

  __ = i18n( params.lang == 'fr' ? frLabels: {} );

  log = debug( 'favorites' );

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

      if ( params.bottomBar ) {

        bBar.setContent(
          __( 'You have now %count% events in your selection', { '%count%' : favUids.length } ) 
          + ' - <a href="' + params.res.actions + '">' + __( 'import' ) + '</a>'
          + ' - <a class="js_fav_clear">' + __( 'clear' ) + '</a>' 
        );

        bBar.show( 5000 );

      }

      _eventifyClear();

    } );

  } );

}


function menu() {

  if ( !favUids.length ) {

    if ( du.el( params.selectors.menu ) ) {

      du.addClass( du.el( params.selectors.menu ), params.classes.displayNone );
      du.removeClass( du.el( params.selectors.empty ), params.classes.displayNone );

    }

    return;

  }

  var query = qs.stringify( { search: { uids: favUids } } );

  du.el( params.selectors.info ).innerHTML = du.el( params.selectors.info ).innerHTML.replace( '{count}', favUids.length );

  utils.forEach( du.els( params.selectors.exports ), function( linkElem ) {

    linkElem.setAttribute( 'href', linkElem.getAttribute( 'href' ) + '?' + query );

  } );

  du.addClass( du.el( params.selectors.empty ), params.classes.displayNone );
  du.removeClass( du.el( params.selectors.menu ), params.classes.displayNone );

  _eventifyClear();

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

    menu();

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