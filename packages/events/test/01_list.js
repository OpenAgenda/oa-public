"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const async = require( 'async' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( './service' );

describe( 'events - functional (server): list', function() {

  this.timeout( 50000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  after( svc.shutdown );

  it( 'simple list', done => {

    svc.list( 0, 5, ( err, events ) => {

      should( err ).equal( null );

      events.length.should.equal( 5 );

      done();

    } );

  } );


  it( 'base list does not include draft or private events', done => {

    svc.list( 0, 20, ( err, events ) => {

      events.filter( e => e.private ).length.should.equal( 0 );

      events.filter( e => e.draft ).length.should.equal( 0 );

      done();

    } );

  } );


  it( 'search searches', done => {

    svc.list( { search: 'Pierre' }, 0, 10, ( err, events ) => {

      events.length.should.not.equal( 0 );

      events.map( e => JSON.stringify( e.title ).toLowerCase() )
        .filter( t => t.includes( 'pierre' ) )
        .length
        .should.equal( events.length );

      done();

    } );

  } );


  it( 'gives a promise if no callback is defined', async () => {

    const result = await svc.list( { search: 'Pierre' }, 0, 2 );

    result.events.length.should.equal( 2 );

  } );


  it( 'search by uids', async () => {

    const result = await svc.list( { uid: [ 68645096, 74935370, 18957259 ] }, 0, 20 );

    result.events.map( e => e.uid ).should.eql( [ 18957259, 68645096, 74935370 ] );

  } );


  it( 'retrieve events created after a given date', async () => {

    const result = await svc.list( { 
      createdAt: new Date( '2017-01-01' ),
      uid: [ 68645096, 74935370, 18957259 ]
    }, 0, 20 );

    result.events.length.should.equal( 1 );

    result.events[ 0 ].uid.should.equal( 18957259 );

  } );


  it( 'list with private to true gets private events only', done => {

    svc.list(  0, 20, { private: true }, ( err, events ) => {

      events.filter( e => e.private ).length.should.equal( events.length );

      done();

    } );

  } );

  it( 'list with private to null gets both private and non private events', done => {

    svc.list( { uid: [ 3564473, 64549836, 48641508 ] }, 0, 20, { private: null }, ( err, events ) => {

      events.filter( e => !e.private ).length.should.not.equal( 0 );

      events.filter( e => e.private ).length.should.not.equal( 0 );

      done();

    } );

  } );


  it( 'list with private in query to true gets private events only', done => {

    svc.list( { private: true }, 0, 20, ( err, events ) => {

      events.filter( e => e.private ).length.should.equal( events.length );

      done();

    } );

  } );

  it( 'list with private in query to null gets both private and non private events', done => {

    svc.list( { private: null, uid: [ 3564473, 64549836, 48641508 ] }, 0, 20, ( err, events ) => {

      events.filter( e => !e.private ).length.should.not.equal( 0 );

      events.filter( e => e.private ).length.should.not.equal( 0 );

      done();

    } );

  } );

  it( 'only list fields are given', done => {

    svc.list( 0, 1, ( err, events ) => {

      Object.keys( events[ 0 ] ).should.eql( [ 
        'slug',
        'uid',
        'title',
        'description',
        'keywords',
        'image',
        'timezone',
        'updatedAt',
        'createdAt',
        'locationUid',
        'accessibility',
        'age',
        'registration' 
      ] );

      done();

    } );

  } );

  it( 'keywords appear as lists', done => {

    svc.list( { uid: 48641508 }, 0, 1, ( err, events ) => {

      events[ 0 ].keywords.should.eql( {
        fr: [ 'famille', 'animation', 'enfant', 'monument' ]
      } );

      done();

    } );

  } )

  it( 'if detailed option is set, non-list fields are also given', done => {

    svc.list( 0, 1, { detailed: true }, ( err, events ) => {

      Object.keys( events[ 0 ] ).should.eql( [
        'slug',
        'uid',
        'title',
        'description',
        'longDescription',
        'keywords',
        'image',
        'draft',
        'private',
        'timezone',
        'timings',
        'updatedAt',
        'createdAt',
        'agendaUid',
        'locationUid',
        'accessibility',
        'age',
        'registration',
        'fileKey',
        'agenda',
        'location'
      ] );

      done();

    } );

  } );

  it( 'if detailed and html options are set, longDescription is parsed into html and set in html field', done => {

    svc.list( { uid: 3681352 }, 0, 100, { detailed: true, html: true }, ( err, events ) => {

      events[ 0 ].html.should.eql( {
        fr: '<p>Championnat de France.</p>\n<p>Tournois réservé aux Espoirs, Vétérans</p>\n'
      } );

      done();

    } );

  } );

  it( 'if detailed option is set, additional information is fetched for location and origin agenda', done => {

    svc.list( { uid: [ 1517683 ] }, 0, 1, { detailed: true }, ( err, events ) => {

      _.pick( events[ 0 ], [ 'location', 'agenda' ] ).should.eql( { 
        location: { 
          name: 'La case de Janine',
          uid: 25756772,
          latitude: 48.8674277,
          longitude: 2.350881,
          address: '1 passage du ponceau, Paris'
        },
        agenda: { 
          uid: 27545135,
          title: 'La Gargouille',
          image: null,
          offical: true 
        } 
      } );

      done();

    } );

  } );


  it( 'if image is provided, image path is placed in base key', done => {

    svc.list( { uid: 48641508 }, 0, 1, ( err, events ) => {

      events[ 0 ].image.base.should.equal( config.image.base );

      done();

    } );

  } );


  it( 'if draft is specified in query, it is added to fields', done => {

    svc.list( { draft: null }, 0, 1, ( err, events ) => {

      Object.keys( events[ 0 ] ).indexOf( 'draft' ).should.not.equal( -1 );

      done();

    } );

  } );


  it( 'if private is specified in query, it is added to fields', done => {

    svc.list( { private: null }, 0, 1, ( err, events ) => {

      Object.keys( events[ 0 ] ).indexOf( 'private' ).should.not.equal( -1 );

      done();

    } );

  } );


  it( 'list does not give deleted events', done => {

    svc.list( { uid: [ 31638453, 1517683, 68645096 ] }, 0, 20, ( err, events ) => {

      events.filter( e => e.uid === 31638453 ).length.should.equal( 0 );

      events.filter( e => [ 1517683, 68645096 ].indexOf( e.uid ) !== -1 ).length.should.equal( 2 );

      done();

    } );

  } );

} );
