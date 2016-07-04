"use strict";

const utils = require( 'utils' );
const du = require( 'dom-utils' );

export default utils.extend( create, {
  switchOn, switchOff, handler
} );

let trackers = []; // { name: 'search', 'selector': '.search', bodyEvent: null, elemEvent: null }

function switchOn( name ) {

  if ( typeof document == 'undefined' ) return;

  trackers.filter( t => t.name === name ).forEach( t => {

    let { body, elem } = _getElems( t.selector );

    switchOff( name );

    if ( !body || !elem ) return;

    t.onElemClick = e => {

      t.clicked = true;

    } 

    t.onBodyClick = e => {

      if ( t.clicked ) {

        t.clicked = false;

        return;

      }

      t.clicked = false;

      switchOff( name );

      t.handler ? t.handler() : null;

    }

    du.addEvent( elem, 'click', t.onElemClick );
    du.addEvent( body, 'click', t.onBodyClick );
  
  } );

}

function switchOff( name ) {

  if ( typeof document == 'undefined' ) return;

  trackers.filter( t => t.name === name ).forEach( t => {

    let { body, elem } = _getElems( t.selector );

    if ( !elem ) return;

    du.removeEvent( body, 'click', t.onBodyClick );
    du.removeEvent( elem, 'click', t.onElemClick );

  } );

}

function create( name, selector, handler = null ) {

  let matches = trackers.filter( t => t.name === name );

  if ( matches.length ) {

    matches[ 0 ].selector = selector;

    switchOn( name );

    return;

  }

  trackers.push( {
    name: name,
    selector: selector,
    onBodyClick: null,
    onElemClick: null,
    handler: handler
  } );

  switchOn( name );

}

function handler( name, handler ) {

  trackers.filter( t => t.name === name )

  .forEach( t => {

    t.handler = handler;

  } );

}

function _getElems( selector ) {

  return {
    body: document.querySelector( 'body' ),
    elem: document.querySelector( selector )
  }

}