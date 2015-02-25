module.exports = process;

process.init = init;

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod' ),

log,

params = {
  ownerUid: false,
  adminAgendaUids: [],
  selectors: {
    topNav: '.js_top_nav',
    controls: '.js_admin_controls'
  },
  classes: {
    displayNone: 'display-none'
  },
  testFunc: _test // optional function for substituting to test
};


function init() {

  hide();

  _move();

}

function process( session, options ) {

  var i;

  cn.extend( params, options );

  log = debug( 'adminControls' );

  if ( params.testFunc( session ) ) {

    _display();

  };
    
}


function hide() {

  if (typeof log !== 'undefined') log( 'hiding' );

  cn.addClass( cn.el( params.selectors.controls ), params.classes.displayNone );

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

  cn.removeClass( cn.el( params.selectors.controls ), params.classes.displayNone );

}

function _move() {

  var elem = cn.el( params.selectors.controls );

  cn.el( params.selectors.topNav ).insertAdjacentElement( 'afterend', elem );

}