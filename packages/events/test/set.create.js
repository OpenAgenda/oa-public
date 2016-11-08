"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'set: create an event', function() {

  this.timeout( 5000 );

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event + '_empty'
    ], done );

  } );

  it( 'create the simplest event', done => {

    svc.set( {
      title: {
        fr: 'My first event'
      }
    }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( {
        valid: true,
        success: true,
        errors: [],
        event: { 
          slug: 'my-first-event',
          uid: result.event.uid,
          title: { fr: 'My first event' },
          description: {},
          longDescription: {},
          keywords: {},
          draft: 1,
          private: 0,
          registration: [],
          image: {
            filename: null,
            credits: null,
            size: {
              height: null,
              width: null
            },
            variants: []
          },
          keywords: {},
          timezone: 'Europe/Paris',
          timings: [],
          updatedAt: result.event.updatedAt,
          createdAt: result.event.createdAt,
          locationUid: null,
          accessibility: {
            hi: false, mi: false, pi: false, sl: false, vi: false
          },
          age: {
            min: null,
            max: null
          }
        }
      } );

      let con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.event} where uid=${result.event.uid}`, ( err, rows ) => {

        rows.length.should.equal( 1 );

        new Date( rows[ 0 ].updated_at ).toString().should.equal( result.event.updatedAt.toString() );
        new Date( rows[ 0 ].created_at ).toString().should.equal( result.event.createdAt.toString() );

        done();

      } );

    } );

  } );


  it( 'create the most complete event', done => {

    svc.set( {
      title: {
        fr : 'Un titre'
      },
      slug: 'un-titre',
      ownerUid: 123,
      agendaUid: 456,
      locationUid: 789,
      draft: false,
      description: {
        fr: 'Une description'
      },
      longDescription: {
        fr: 'Une description longue'
      },
      keywords: {
        fr: 'Des, mots, clés'
      },
      conditions: {
        fr: 'Etre vivant'
      },
      registration: [
        '018436269',
        'email@site.com',
        'https://website.com'
      ],
      image: {
        filename: 'image.jpg',
        credits: 'Cé moi kai pri la foto',
        size: {
          height: null,
          width: null
        },
        variants: []
      },
      accessibility: {
        mi: true,
        hi: true
      },
      timezone: 'Europe/Paris',
      timings: [ {
        begin: new Date(),
        end: new Date()
      } ],
      age: {
        min: 2,
        max:76
      }
    }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.should.eql( {
        slug: 'un-titre',
        uid: result.event.uid,
        title: {
          fr: 'Un titre'
        },
        description: {
          fr: 'Une description'
        },
        longDescription: {
          fr: 'Une description longue'
        },
        keywords: { 
          fr: 'Des, mots, clés'
        },
        image: {
          filename: 'image.jpg',
          credits: 'Cé moi kai pri la foto',
          size: {
            height: null,
            width: null
          },
          variants: []
        },
        draft: 0,
        private: 0,
        timezone: 'Europe/Paris',
        timings: [ {
          begin: result.event.timings[ 0 ].begin,
          end: result.event.timings[ 0 ].begin,
        } ],
        updatedAt: result.event.updatedAt,
        createdAt: result.event.createdAt,
        locationUid: 789,
        accessibility: {
          mi: true,
          hi: true,
          pi: false,
          vi: false,
          sl: false
        },
        age: {
          min: 2,
          max: 76
        },
        registration: [
          '018436269',
          'email@site.com',
          'https://website.com'
        ]
      } );

      done();

    } );

  } );

} );