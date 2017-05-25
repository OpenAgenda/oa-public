"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  _ = require( 'lodash' ),

  mysql = require( 'mysql' ),

  async = require( 'async' );

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


  it( 'list with private to true gets private events only', done => {

    svc.list( { private: true }, 0, 20, ( err, events ) => {

      events.filter( e => e.private ).length.should.equal( events.length );

      done();

    } );

  } );

  it( 'list with private to null gets both private and non private events', done => {

    svc.list( { private: null }, 0, 20, ( err, events ) => {

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

    svc.list( 0, 1, ( err, events ) => {

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
        'location',
        'agenda'
      ] );

      done();

    } );

  } );

  it( 'if detailed option is set, additional information is fetched for location and origin agenda', done => {

    svc.list( 3, 1, { detailed: true }, ( err, events ) => {

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

    svc.list( 0, 20, ( err, events ) => {

      events.filter( e => e.uid === 31638453 ).length.should.equal( 0 );

      events.filter( e => [ 1517683, 68645096 ].indexOf( e.uid ) !== -1 ).length.should.equal( 2 );

      done();

    } );

  } );

} );