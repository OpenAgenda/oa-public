"use strict";

const should = require( 'should' );

const multilingual = require( '../lib/transform/multilingual' );
const flattener = require( 'flattener' );

describe( 'flat-exports - unit - transforms', () => {

  /**
   * these helpers build mapping for flattener
   */

  describe( 'multilingual', () => {

    test( 'multilingual field returns single value configuration when language is specified', () => {

      const map = [ multilingual( {
        languages: [ 'fr' ]
      }, {
        source: 'title'
      } ) ];

      const flatten = flattener( map );

      const flat = flatten( {
        title: {
          fr: 'Un titre',
          en: 'A title'
        }
      } );

      flat.should.eql( {
        title: 'Un titre'
      } );

    } );

    test( 'multilingual field puts value in target field when set', () => {

      const map = [ multilingual( { 
        languages: [ 'en' ]
      }, {
        source: 'title',
        target: 'Titre'
      } ) ];

      const flatten = flattener( map );

      const flat = flatten( {
        title: {
          en: 'Here is the title'
        }
      } );

      flat.should.eql( {
        'Titre' : 'Here is the title'
      } );

    } );


    test( 'multilingual field with specified possible languages does not provide other flat values than for said languages', () => {

      const map = [ multilingual( {
        languages: [ 'en', 'it', 'fr', 'es' ],
      }, {
        source: 'country',
        possibleLanguages: [ 'fr', 'en' ]
      } ) ];

      const flatten = flattener( map );

      const flat = flatten( {
        country: {
          en: 'Iceland',
          fr: 'Islande'
        }
      } );

      flat.should.eql( {
        'country - FR' : 'Islande',
        'country - EN' : 'Iceland'
      } );


    } );


    test( 'multilingual field passes data in post parser', () => {

      const map = [ multilingual( {
        languages: [ 'fr', 'en' ]
      }, {
        source: 'some_field',
        post: v => v.join( '|' )
      } ) ];

      const flatten = flattener( map );

      const flat = flatten( {
        some_field: {
          en: [ 'a', 'field' ],
          fr: []
        }
      } );

      flat.should.eql( { 
        'some_field - FR': null, 
        'some_field - EN': 'a|field' 
      } );

    } );


    test( 'multilingual field spreads result over multiple fields if language is not set', () => {

      const map = [ multilingual( {
        languages: [ 'fr', 'en', 'it' ]
      }, {
        source: 'title'
      } ) ];

      const flatten = flattener( map );

      const flat = flatten( {
        title: {
          fr: 'Vente A Emporter',
          en: 'Takeaway'
        }
      } );

      flat.should.eql( {
        'title - FR' : 'Vente A Emporter',
        'title - EN' : 'Takeaway',
        'title - IT' : null
      } );

    } );


  } );

} );