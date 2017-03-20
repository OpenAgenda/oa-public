"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  mysql = require( 'mysql' ),

  async = require( 'async' );

describe( 'events - functional (server): list', function() {

  this.timeout( 50000 );

  beforeEach( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( done => {

    svc.getConfig().knex.destroy( () => done() );

  } );

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