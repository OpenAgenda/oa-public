module.exports = process;

process.hide = hide;

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod' ),

log,

params = {
  ownerUid: false,
  adminAgendaUids: [],
  selectors: {
    controls: '.js_admin_controls'
  },
  classes: {
    displayNone: 'display-none'
  }
};

function process( session, options ) {

  var i;

  cn.extend( params, options );

  log = debug( 'adminControls' );

  if ( !session.logged ) {

    log( 'user is not logged' );

    return;

  }

  if ( session.uid == params.ownerUid ) {

    log( 'user is owner' );

    _display();

    return;

  }

  for ( i = 0; i < params.adminAgendaUids.length; i++ ) {

    if ( session.reviews.admUids.indexOf( params.adminAgendaUids[ i ] + '') !== -1 ) {

      log( 'user is admin' );

      _display();

      return;

    }

  }

}

function hide() {

  cn.addClass( cn.el( params.selectors.controls ), params.classes.displayNone );

}

function _display() {

  cn.removeClass( cn.el( params.selectors.controls ), params.classes.displayNone );

}