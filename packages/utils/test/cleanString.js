"use string";

const should = require( 'should' ),

utils = require( '../' ),

fs = require( 'fs' ),

dirty = fs.readFileSync( __dirname + '/dirty.txt', 'utf-8' ),

clean = fs.readFileSync( __dirname + '/clean.txt', 'utf-8' );

describe( 'utils.cleanString', () => {

  it( 'cleans', () => {

    dirty.split( ';' ).forEach( dirtyChar => {

      utils.cleanString( dirtyChar ).should.equal( ' ' );

    } );

  } );

  it( 'does not clean', () => {

    clean.split( ';' ).forEach( cleanChar => {

      utils.cleanString( cleanChar ).should.equal( cleanChar );

    } )

  } );


} );