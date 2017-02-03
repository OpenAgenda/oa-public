"use strict";

let validate = require( '../service/validate' ),

publicValidate = require( '../service/validate/public' ),

should = require( 'should' );

describe( 'agendas - unit (server): validate', () => {

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
        settings: {
          contribution: {
            defaultState: 2,
            message: null,
            type: 2,
            useFields: false
          },
          translation: {
            enabled: false,
            languages: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
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
        private: false,
        ownerId: 1,
        settings: {
          contribution: {
            defaultState: 2,
            message: null,
            type: 2,
            useFields: false
          },
          translation: {
            enabled: false,
            languages: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        updatedAt: now,
        createdAt: now,
        description: 'Un agenda de tests',
        image: null,
        url: undefined,
        credentials: {
          activatingInvitations: false,
          emailstrategie: false,
          indesign: false,
          moderators: false,
          tags: false,
          embedsHead: false,
          embedsTemplates: false,
          aggregator: false
        }
      } );

    } );

  } );



} );