"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): update', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple update', async () => {

    let result = await svc( 62792452 ).update( 10974548, { featured: true, state: 1 } );

    result.success.should.equal( true );

  } );

  it( 'update userUid is possible through second argument', async () => {

    let result = await svc( 62792452 ).update( 10974548, {
      userUid: 989898
    } );

    result.updated.userUid.should.equal( 989898 );

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

} );