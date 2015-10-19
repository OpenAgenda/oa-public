"use strict";

var du = require( '../../js/lib/domUtils' ),

to = false; // time out ref

module.exports = {
  show: show,
  hide: hide,
  setContent: setContent
}

var params = {
  template: [
    '<div class="edge-bar fixed-bottom">',
      '<ul class="edge-list">',
        '<li class="edge-item">',
          '<span class="edge-info">{content}</span>',
        '</li>',
      '</ul>',
    '</div>'
  ].join( '' )
},

elem, content;

function setContent( c ) {

  content = c;

}

function show( time ) {

  if ( to ) clearTimeout( to );
  
  _display();

  if ( time ) {

    to = setTimeout( function() {

      hide();

    }, time );

  }

}

function hide() {

  if ( !elem ) return;

  du.el( 'body' ).removeChild( elem );

  elem = false;

}

function _display() {

  if ( elem ) hide();

  elem = document.createElement( 'div' );

  elem.innerHTML = params.template.replace( '{content}', content );

  elem = du.childObject( elem, 0 );

  du.el( 'body' ).appendChild( elem );

}