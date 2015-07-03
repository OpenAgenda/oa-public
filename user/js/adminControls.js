module.exports = process;

module.exports.init = init;

module.exports.ifAdmin = ifAdmin;

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod' ),

log,

params = {
  ownerUid: false,
  adminAgendaUids: [],
  selectors: {
    topNav: '.js_top_nav',
    controls: '.js_admin_controls',
    item: '.js_admin_item'
  },
  displaySelectors: false,
  classes: {
    displayNone: 'display-none'
  },
  testFunc: _test // optional function for substituting to test
},

ifAdminCallbacks = [];


function init() {

  hide();

  _move();

}

function ifAdmin( cb ) {

  ifAdminCallbacks.push( cb );

}

function process( session, options ) {

  var i;

  cn.extend( params, options );

  log = debug( 'adminControls' );

  if ( params.testFunc( session ) ) {

    _display();

    cn.forEach( ifAdminCallbacks, function( cb ) {

      cb();

    } );

    return true;

  };

  return false;
    
}


function hide() {

  if (typeof log !== 'undefined') log( 'hiding' );

  cn.addClass( cn.el( params.selectors.controls ), params.classes.displayNone );

  cn.forEach( cn.els( params.selectors.item ), function( item ) {

    cn.addClass( item, params.classes.displayNone );

  } );

}

function _test( session ) {

  if ( !session.logged ) {

    log( 'user is not logged' );

    return false;

  }

  if ( session.uid == params.ownerUid ) {

    log( 'user is owner' );

    _display();

    return true;

  }

  for ( i = 0; i < params.adminAgendaUids.length; i++ ) {

    if ( session.reviews.admUids.indexOf( params.adminAgendaUids[ i ] + '') !== -1 ) {

      log( 'user is admin' );

      return true;

    }

  }

  return false;

}

function _display() {

  if ( !params.displaySelectors ) { 

    params.displaySelectors = [ params.selectors.item ];

  }

  cn.forEach( params.displaySelectors ? params.displaySelectors : [ params.selectors.item ], function( selector ) {

    cn.forEach( cn.els( selector ), function( item ) {

      cn.removeClass( item, params.classes.displayNone );

    });

  });

  cn.removeClass( cn.el( params.selectors.controls ), params.classes.displayNone );

}

function _move() {

  var elem = cn.el( params.selectors.controls );

  cn.el( params.selectors.topNav ).insertAdjacentElement( 'afterend', elem );

}