"use string";

const should = require( 'should' ),

utils = require( '../' ),

fs = require( 'fs' ),

dirty = fs.readFileSync( __dirname + '/dirty.txt', 'utf-8' );

describe( 'utils.cleanString', () => {

  dirty.split( ';' ).forEach( dirtyChar => {

    utils.cleanString( dirtyChar ).should.equal( ' ' );

  } );

} );