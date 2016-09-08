"use strict";

let validate = require( '../service/validate' ),

publicValidate = require( '../service/validate/public' ),

should = require( 'should' );

describe( 'validate', () => {

  describe( 'public validator', () => {

    it( 'validates exposable agenda data', () => {

      let errors = [],

      clean,

      data = {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda'
      }

      try {
        
        clean = publicValidate( data );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.eql( {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda',
        official: false,
        contribution: {
          type: 0,
          message: null
        },
        url: undefined
      } );

    } );

  } );

  describe( 'complete validator', () => {

    it( 'validates data', () => {

      let clean, errors = [],

      now = new Date();

      try {

        clean = validate( {
          uid: 122312,
          ownerId: 1,
          title: 'La gargouille',
          slug: 'la-gargouille',
          description: 'Un agenda de tests',
          updatedAt: now,
          createdAt: now
        } );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.eql( { 
        title: 'La gargouille',
        slug: 'la-gargouille',
        uid: 122312,
        official: false,
        ownerId: 1,
        contribution: { 
          type: 0,
          message: null
        },
        updatedAt: now,
        createdAt: now,
        description: 'Un agenda de tests',
        image: null,
        url: undefined,
        credentials: { 
          moderators: false,
          tags: false,
          embedsHead: false,
          embedsTemplates: false 
        }
      } );

    } );

  } );



} );