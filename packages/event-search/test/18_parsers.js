'use strict';

const fs = require( 'fs' );
const should = require( 'should' );

const parsers = require( '../parsers' );

const fixtures = JSON.parse( fs.readFileSync( __dirname + '/service/parsers/geoJSON.in.json', 'utf-8' ) );
const expected = JSON.parse( fs.readFileSync( __dirname + '/service/parsers/geoJSON.out.json', 'utf-8' ) );

describe( 'event search - functional: parsers', function() {

  it( 'geoJSON post parsers transforms search result into geoJSON data', () => {

    parsers.geoJSON( fixtures ).should.eql( expected );

  } );

} );
