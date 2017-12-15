"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  mysql = require( 'mysql' ),

  ih = require( 'immutability-helper' );

describe( 'events - functional (server): update', function() {

  this.timeout( 30000 );

  let id = 146173;

  beforeEach( done => {

    svc.initAndLoad( config, done );

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

      JSON.stringify( result.event.timings[ 0 ].begin )
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

    } );

  } );

} );