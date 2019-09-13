"use strict";

const should = require( 'should' );

const reversoTest = require( '../src/reverso' );

const config = require( '../testconfig' );

describe( 'reverso', function() {

  jest.setTimeout( 30000 );

  describe( 'successful requests', () => {

    jest.setTimeout( 10000 );

    let r;

    beforeAll( () => {

      r = reversoTest( config.reverso );

    } );


    it( 'makes a single translation', done => {

      r( 'Les portes du temps des jeunes et des patrimoines', 'en', ( err, translation ) => {

        translation.should.equal('The gates of youth and heritage times');

        done();

      } );

    } );

    it( 'make a translation from english to french', done => {

      r( 'Well this works just swell mister', 'en', 'fr', ( err, translation ) => {

        should( err ).equal( null );

        translation.should.equal( 'Eh bien, ça marche, monsieur' );

        done();

      } );

    } );

    it( 'makes a translation from english to french with a separator character', done => {

      r( 'I sure hope this works|||And this as well', 'en', 'fr', ( err, translation ) => {

        translation.should.equal( 'J’espère que ça marchera|||Et ça aussi' );

        done();

      } );

    } );



    it( 'empty or undefined source language gives back empty string', done => {

      r( undefined , 'en', ( err, translation ) => {

        translation.should.equal( '' );

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
          'This translates from the markdown',
          '## How?',
          'Simple:',
          '*   the markdown is interpreted in html before translation',
          '*   and the html of the response is translated into markdown after',
          '*   It translates from everywhere.'
        ] );

        done();

      } );

    } );

    it( 'makes multiple translations in one call', done => {

      r( 'Les chaussettes de l\'archiduchesse sont-elles sèches ou archi-sèches', [ 'en', 'es' ], ( err, translations ) => {

        should( err ).equal( null );

        translations.should.eql( {
          en: 'Are the Archduchess’s socks dry or super-dry',
          es: 'Los calcetines de la archiduquesa son secos o archi-secos'
        } );

        done();

      } );

    } );

    it( 'Translation from french to german works', done => {

      r( 'Je suis mal en campagne et mal en ville', 'fr', 'de', ( err, translation ) => {

        done();

      } );

    } );

    it( 'Translation from french to english works', done => {

      r( 'Peut-être un peu trop fragile', 'fr', 'en', ( err, translation ) => {

        translation.should.equal( 'Maybe a little too fragile' );

        done();

      } );

    } );

    it( 'Translation from french to italian works', done => {

      r( 'Allo maman bobo', 'fr', 'it', ( err, translation ) => {

        translation.should.equal( 'Ciao mamma bobo' );

        done();

      } );

    } );

    it( 'translates an object', done => {

      r( {
        title: 'La fourchette',
        description: 'La fourchette est un couvert de table ou un ustensile de cuisine permettant d\'attraper les aliments, sans les toucher directement avec les doigts.'
      }, 'en', ( err, translatedObject ) => {

        translatedObject.should.eql( {
          title: 'The fork',
          description: 'The fork is a table cover or kitchen utensil for catching food without touching it directly with your fingers.'
        } );

        done();

      } );

    } );

    it( 'translates an object in multiple languages', done => {

      r( {
        title: 'La fourchette',
        description: 'La fourchette est un couvert de table ou un ustensile de cuisine permettant d\'attraper les aliments, sans les toucher directement avec les doigts.'
      }, [ 'en', 'es' ], ( err, translatedObject, timeouts ) => {

        should( err ).equal( null );

        translatedObject.should.eql( {
          title: {
            en: 'The fork',
            es: 'El tenedor'
          },
          description: {
            en: 'The fork is a table cover or kitchen utensil for catching food without touching it directly with your fingers.',
            es: 'El tenedor es un cubierto de mesa o un utensilio de cocina que permite coger los alimentos sin tocarlos directamente con los dedos.'
          }
        } );

        done();

      } );

    } );


    it( 'if given an array in input, returns a keyed result', done => {

      r( {
        title: 'La fourchette'
      }, [ 'en' ], ( err, obj ) => {

        obj.should.eql( { title: { en: 'The range' } } );

        done();

      } );

    } );

  } );

  describe( 'timeouts', () => {

    let r = reversoTest( Object.assign( {
      timeout: 1
    }, config.reverso ) );

    it( 'simple translation timeout', done => {

      r( 'La fourchette', 'en', ( err, str ) => {

        err.toString().should.equal( 'Error: timeout of 1ms exceeded' );

        done();

      } );

    } );

    it( 'multiple lang timeout errors are given in third argument of cb', done => {

      r( 'La fourchette', [ 'en', 'es' ], ( err, translations, translationErrors ) => {

        should( err ).equal( null );

        translations.should.eql( {} );

        translationErrors.should.eql( [ { lang: 'en' }, { lang: 'es' } ] );

        done();

      } );

    } );

    it( 'object translation timeout gives timed out fields and langs as a flat list in third arg of cb', done => {

      r( {
        title: 'Le bouc',
        description: 'Le bouc est le mâle de la chèvre.'
      }, [ 'es', 'de' ], ( err, translations, timeoutErrors ) => {

        should( err ).equal( null );

        translations.should.eql( {} );

        timeoutErrors.should.eql( [
          { lang: 'es' },
          { lang: 'de' }
        ] );

        done();

      } );

    } );

  } );

} );
