"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );

const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( './service' );

const externalServices = require( './service/externalServices' );

describe( 'events -04- functional (server): update', function() {

  this.timeout( 30000 );

  let id = 146173;

  beforeEach( done => {

    externalServices.init( config.tests );

    svc.initAndLoad( ih( config, {
      interfaces: {
        imageFilesLoad: {
          $set: externalServices.imageFiles.load
        }
      }
    } ), done );

  } );

  afterEach( svc.shutdown );

  it( 'update the event title', done => {

    svc.update( id, {
      title: {
        fr: 'Titre à jour'
      }
    }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.title.should.eql( {
        fr: 'Titre à jour'
      } );

      done();

    } );

  } );


  it( 'update the event title using async/await', async () => {

    let result = await svc.update( id, {
      title: { fr: 'Titre toujours à jour' }
    } );

    result.event.title.should.eql( {
      fr: 'Titre toujours à jour'
    } );

  } );


  it( 'update the image given a url', async () => {

    const { event } = await svc.update( id, {
      image: {
        url: 'https://s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
      }
    } );

    event.image.size.should.eql( { width: 600, height: 600 } );

  } );

  it( 'absent title is considered invalid for non draft event', done => {

    svc.update( id, { title: {} }, { draft: false }, ( err, result ) => {

      result.success.should.equal( false );

      result.errors.should.eql( [ {
        field: 'title',
        code: 'required',
        message: 'at least one language entry is required',
        origin: {}
      } ] );

      done();

    } );

  } );


  it( 'absent title is considered valid for draft event', done => {

    svc.update( id, { title: {} }, { draft: true }, ( err, result ) => {

      result.success.should.equal( true );

      done();

    } );

  } );

  describe( 'timings', () => {

    it( 'new timings replace previous timings set', async () => {

      const event = await svc.get( id );

      // there were 2 timings
      event.timings.length.should.equal( 2 );

      // they were different from the intended change
      for ( const t of event.timings ) {

        JSON.stringify( t ).should.not.equal( '"2017-10-24T20:00:00.000Z"' );

      }

      const result = await svc.update( id, {
        timings: [ {
          begin: new Date( '2017-10-24T20:00:00Z' ),
          end: new Date( '2017-10-24T22:00:00Z' )
        } ]
      } );

      result.success.should.equal( true );

      result.event.timings.length.should.equal( 1 );

      JSON.stringify( result.event.timings[ 0 ].begin )
        .should.equal( '"2017-10-24T20:00:00.000Z"' );

    } );

    it( 'if an empty timing list is specified, for update a validation error should be given', async () => {

      const { errors } = await svc.update( id, {
        timings: []
      } );

      errors.length.should.equal( 1 );

      errors[ 0 ].field.should.equal( 'timings' );

      errors[ 0 ].code.should.equal( 'list.required' );

    } );

  } );


  it( 'an updated with internal boolean to true gives back "internal" fields', done => {

    svc.update( id, {
      "conditions" : "Its free!"
    }, { internal: true }, ( err, result ) => {

      result.success.should.equal( true );

      result.event.id.should.equal( id );

      done();

    } );

  } );


  it( 'a default update gives back event data excluding "internal" fields', done => {

    svc.update( id, {
      "accessibility" : {
        "hi" : true
      }
    }, ( err, result ) => {

      result.success.should.equal( true );

      should( result.id ).equal( undefined );

      done();

    } );

  } );


  it( 'unprotected update with updatedAt value updates updatedAt value', async () => {

    const updatedAt = new Date( '1979-07-08' );

    const result = await svc.update( id, {
      updatedAt
    }, { protected: false } );

    result.event.updatedAt.getTime().should.equal( updatedAt.getTime() );

  } );


  describe( 'interfaces', () => {

    afterEach( svc.shutdown );

    it( 'if a userUid is specified in context, it is given in interfaces', done => {

      svc.init( ih( config, {
        interfaces: {
          onUpdate: {
            $set: ( before, after, context ) => {

              context.should.eql( {
                userUid: 12,
                agendaUid: null,
                transferToLegacy: false,
                updateSearchIndex: true
              } );

              done();

            }
          }
        }
      } ) );

      svc.update( id, {
        conditions : 'Its free!'
      }, { context: { userUid: 12 } }, ( err, result ) => {} );

    } );

  } );

  describe( 'invalid updates', () => {

    it( 'invalid image return unsuccessful result with error code and step', async () => {

      const result = await svc.update( id, {
        image: {
          url: 'https://some.rand.om/invalid.imagepath.jpg'
        }
      } );

      result.valid.should.equal( false );

      _.get( result, 'errors.0.code' ).should.equal( 'ENOTFOUND' );

      _.get( result, 'errors.0.step' ).should.equal( 'image' );

    } );

  } );

} );
