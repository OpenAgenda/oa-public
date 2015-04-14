"use strict";

var cn = require( '../../js/lib/common/common.mod.js' ),

cTemplater = require( './clientTemplater' ),

tpl = 'user/transferMessage';

module.exports = function() {

  if ( !_show() ) return;

  cTemplater( tpl, {}, function( err, template ) {

    _print( template.render( {} ) );

  } );

}

function _show() {

  var query = window.location.href.split('?');

  return query.indexOf( 'cibul=' ) !==-1;

}

function _print( render ) {

  var d = document.createElement( 'div' );

  d.innerHTML = render;

  d.className = 'popup-overlay share-menu';

  cn.el( 'body' ).insertAdjacentElement( 'beforeend', d );

  cn.addEvent( d, 'click', function( e ) {

    cn.el( 'body' ).removeChild( d );

  });

}