"use strict";

const fs = require( 'fs' );

const formatEvent = require( '../server/lib/formatEvent' );

const inputEvent = JSON.parse( fs.readFileSync( __dirname + '/data/event.json', 'utf-8' ) );
const decoratedEvent = JSON.parse( fs.readFileSync( __dirname + '/data/event.decorated.json', 'utf-8' ) );

describe( 'unit - formatEvent', () => {

  test( 'flatten and decorate event to get it ready for docx', () => {

    expect( formatEvent( inputEvent, 'fr' ) ).toEqual( decoratedEvent );

  } );

} );