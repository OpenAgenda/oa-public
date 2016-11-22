"use strict";

const should = require( 'should' );

const reverso = require( '../reverso' );

const config = require( '../testconfig' );

const depr = require( '../../../scripts/eveAgendas/lib/reverso' );

describe( 'reverso', function( done ) {

  it( 'makes a single translation', done => {

    let r = reverso( config.reverso );

    r( 'Les portes du temps des jeunes et des patrimoines', 'en', ( err, translation ) => {

      should( err ).equal( null );

      translation.should.equal( 'The doors of the time(weather) of the young people and the heritage(holdings)' );

      done();

    } );

  } );


  it( 'makes multiple translations', done => {

    let r = reverso( config.reverso );

    r( 'Les chaussettes de l\'archiduchesse sont-elles sèches ou archi-sèches', [ 'en', 'es' ], ( err, translations ) => {

      should( err ).equal( null );

      translations.should.eql( { 
        en: 'The socks of the archduchess are dry or extremely dry',
        es: 'Los calcetines de la archiduquesa son secas o archi-secas'
      } );

      done();

    } );

  } );

} );