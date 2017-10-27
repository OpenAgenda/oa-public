"use strict";

const should = require( 'should' );
const formatEvent = require( '../lib/rss/formatEvent' );
const event = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/sortir-a-boulogne-billancourt.json', 'utf-8' ) );

describe( 'flat-exports - unit - rss', () => {

  test( 'formatEvent', () => {

    console.log(formatEvent( event ));

  } );

} );