"use strict";

const should = require( 'should' );

const reverso = require( '../reverso' );

const config = require( '../testconfig' );

const depr = require( '../../../scripts/eveAgendas/lib/reverso' );

describe( 'reverso', function( done ) {

  let r;

  before( () => {

    r = reverso( config.reverso );

  } );


  it( 'makes a single translation', done => {

    r( 'Les portes du temps des jeunes et des patrimoines', 'en', ( err, translation ) => {

      should( err ).equal( null );

      translation.should.equal( 'The doors of the time(weather) of the young people and the heritage(holdings)' );

      done();

    } );

  } );

  it( 'makes a translation of a markdown text', done => {

    r( [
      '# Résumé',
      'Ceci traduit du markdown',
      '## Comment?',
      'Simple:',
      '',
      ' * le markdown est interpreté en html avant traduction',
      ' * et l\'html de la réponse est traduit en markdown après',
      ' * ça traduit de partout.'
    ].join( '\n' ), 'en', ( err, translation ) => {

      translation.split( '\n' ).should.eql( [
        '# Summary',
        'This translates of the markdown',
        '## How?',
        'Simple:',
        '*   The markdown is interpreté html before translation',
        '*   And the html of the answer is translated markdown there later',
        '*   That translates of everywhere.'
      ] );

      done();

    } );

  } );

  it( 'makes multiple translations in one call', done => {

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