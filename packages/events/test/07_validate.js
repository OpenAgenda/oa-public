"use strict";

const should = require( 'should' );
const validate = require( '../service/validate' );
const frontValidate = require( '../service/validate/front' );

describe( 'events - unit (iso): validation', () => {

  it( 'full validation only needs identifier fields, title, and timestamps to be set to declare an event valid', () => {

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

  it( 'public validation only needs title', () => {

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

} );