"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

const should = require( 'should' );

const im = require( 'immutability-helper' );

describe( 'agendaEvents - functional (server): update', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( () => {

    svc.init( config );

  } );

  it( 'simple update', async () => {

    let result = await svc( 62792452 ).update( 10974548, { featured: true, state: 1 } );

    result.success.should.equal( true );

  } );

  it( 'simple update cleans state given as string', async () => {

    let result = await svc( 62792452 ).update( 10974548, { featured: true, state: '1' } );

    result.updated.state.should.equal( 1 );

  } );

  it( 'update userUid is possible through second argument', async () => {

    let result = await svc( 62792452 ).update( 10974548, {
      userUid: 989898
    } );

    result.updated.userUid.should.equal( 989898 );

  } );

  it( 'simple update to refused state', async () => {

    const result = await svc( 62792452 ).update( 10974548, {
      state: -1
    } );

    result.updated.state.should.equal( -1 );

  } );

  it( 'simple update to canEdit set to true', async () => {

    const result = await svc( 62792452 ).update( 10974548, {
      canEdit: true
    } );

    result.updated.canEdit.should.equal( true );

  } );

  it( 'update is part update', async () => {


    await svc( 62792452 ).update( 10974548, {
      canEdit: true
    } );

    const result = await svc( 62792452 ).update( 10974548, {
      state: -1
    } );

    result.updated.canEdit.should.equal( true );

  } );

  it( 'simple update forcing timestamp values', async () => {

    let createdAt = new Date( '2017-02-28T08:00:00.000Z' );

    let updatedAt = new Date( '2017-03-28T08:00:00.000Z' ); 

    let result = await svc( 62792452 ).update( 10974548, {
      featured: true,
      state: 2,
      createdAt,
      updatedAt
    }, { protected: false } );

    result.updated.createdAt.toString().should.equal( createdAt.toString() );

    result.updated.updatedAt.toString().should.equal( updatedAt.toString() );

  } );


  it( 'context can be passed in options to be transfered to onUpdate interface', done => {

    svc.init( im( config, {
      interfaces: {
        onUpdate: {
          $set: ( before, after, context ) => {

            context.should.eql( {
              userUid: 111,
              agendaUid: null,
              transferToLegacy: false,
              agenda: null,
              event: null,
              legacy: true
            } );

            done();

          }
        }
      }
    } ) );

    svc( 62792452 ).update( 10974548, { featured: true }, {
      context: {
        userUid: 111,
        agendaUid: null,
        transferToLegacy: false,
        agenda: null,
        event: null,
        legacy: true
      }
    } );

  } );

} );
