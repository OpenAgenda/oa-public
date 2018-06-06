"use strict";

const should = require( 'should' );
const labels = require( '@openagenda/labels/event/exportFieldNames' );
const getFlattener = require( '../lib/transform' ).getFlattener;
const event = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/sortir-a-boulogne-billancourt.json', 'utf-8' ) );

describe( 'flat-exports - unit - spreadsheet_flatten', () => {

  test( 'test', () => {

    const flatten = getFlattener( {
      lang: 'fr',
      languages: [ 'fr', 'en', 'it' ],
      labels
    } );

    event.should.be.ok;

  } );

} );