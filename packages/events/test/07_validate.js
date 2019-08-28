"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const validate = require( '../service/validate' );
const frontValidate = require( '../service/validate/front' );
const draftValidate = require( '../service/validate' ).draft;

describe( 'events -07- unit (iso): validation', () => {

  describe( 'full', () => {

    it( 'only needs identifier fields, title, and timestamps to be set to declare an event valid', () => {

      let clean, errors = [], d = new Date();

      try {

        clean = validate( {
          id: 1,
          uid: 123,
          slug: 'a-slug',
          title: {
            fr: 'Un titre'
          },
          timings: [ {
            begin: d,
            end: d
          } ],
          updatedAt: d,
          createdAt: d
        } )

      } catch ( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.eql( {
        id: 1,
        uid: 123,
        slug: 'a-slug',
        agendaUid: null,
        ownerUid: null,
        creatorUid: null,
        title: {
          fr: 'Un titre'
        },
        description: {},
        longDescription: {},
        keywords: {},
        links: [],
        conditions: {},
        accessibility: {
          hi: false,
          mi: false,
          pi: false,
          sl: false,
          vi: false
        },
        fileKey: null,
        image: {
          filename: null,
          credits: null,
          size: {
            height: null,
            width: null
          },
          variants: []
        },
        registration: [],
        references: [],
        timezone: 'Europe/Paris',
        locationUid: null,
        private: false,
        timings: [ {
          begin: d,
          end: d
        } ],
        draft: true,
        age: {
          min: null,
          max: null
        },
        updatedAt: d,
        createdAt: d,
        deletedAt: undefined
      } );

    } );

  } );

  describe( 'front', () => {

    it( 'public validation requires slug by default', () => {

      try {

        frontValidate( {} );

      } catch ( errors ) {

        errors.filter( e => e.field === 'slug' ).length.should.equal( 1 );

      }

    } );


    it( 'public validation can be set to render slug optional', () => {

      try {

        frontValidate( {}, { optionalSlug: true } )

      } catch ( errors ) {

        errors.filter( e => e.field === 'slug' ).length.should.equal( 0 );

      }

    } );


    it( 'public validation can be set to ignore slug', () => {

      const clean = frontValidate( {
        title: {
          fr: 'Un titre'
        },
        timings: [ {
          begin: new Date(),
          end: new Date()
        } ]
      }, { optionalSlug: true } );

      clean.title.fr.should.equal( 'Un titre' );

    } );


    it( 'public validation needs title and slug and timings', () => {

      let clean, errors = [], d = new Date();

      try {

        clean = frontValidate( {
          slug: 'un-titre',
          title: {
            fr: 'Un titre'
          },
          timings: [ {
            begin: d,
            end: d
          } ]
        } );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.eql( {
        slug: 'un-titre',
        locationUid: null,
        title: {
          fr: 'Un titre'
        },
        description: {},
        longDescription: {},
        conditions: {},
        keywords: {},
        links: [],
        accessibility: {
          hi: false,
          mi: false,
          pi: false,
          sl: false,
          vi: false
        },
        fileKey: null,
        draft: true,
        timings: [ {
          begin: d,
          end: d
        } ],
        registration: [],
        references: [],
        age: {
          min: null,
          max: null
        },
        image: {
          credits: null,
          filename: null,
          size: {
            height: null,
            width: null
          },
          variants: []
        },
        timezone: 'Europe/Paris'
      } );

    } );

    it( 'timings does not validate if is begin or end are null', () => {

      let errors;

      try {

        frontValidate( {
          title: {
            fr: 'Un titre'
          },
          timings: [ { begin: null, end: null } ]
        }, { optionalSlug: true } );

      } catch ( err ) {

        errors = err;

      }

      errors.length.should.equal( 2 );

    } );

    it( 'timings does not validate if is null', () => {

      let errors;

      try {

        frontValidate( {
          title: {
            fr: 'Un titre'
          },
          timings: null
        }, { optionalSlug: true } );

      } catch ( err ) {

        errors = err;

      }

      errors.length.should.equal( 1 );

    } );

    it( 'timings does not validate if there are more than 800 timings', () => {

      try {

        frontValidate( {
          title: {
            fr: 'Un titre'
          },
          timings: _timings( new Date, 801 )
        }, { optionalSlug: true } );

      } catch ( errors ) {

        errors.length.should.equal( 1 );
        _.get( errors, '0.message' ).should.equal( 'list is too long' );
        _.get( errors, '0.field' ).should.equal( 'timings' );

      }

    } );

  } );

} );


function _timings( start, count ) {

  const timings = [];

  let cursor = start;

  for ( let i = 0; i<count; i++ ) {

    timings.push( {
      begin: cursor,
      end: cursor
    } );

    cursor.setDate( cursor.getDate() + 1 );

  }

  return timings;

}
