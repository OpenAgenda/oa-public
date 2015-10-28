"use strict";

var should = require( 'should' ),

es = require( '../' );

describe( 'hfdsqf', function() {

  this.timeout( 10000 );

  it( 'sweep', ( done ) => {

    es.refresh( ( err, result ) => {

      console.log( 'done');

      done();

    } );

  });

});