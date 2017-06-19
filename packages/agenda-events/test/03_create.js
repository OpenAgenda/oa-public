"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): create', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple create', done => {

    svc( 1111 ).create( 2222 ).then( result => {

      let con = mysql.createConnection( config.mysql );

      con.query( 'select * from agenda_event where agenda_uid = ? and event_uid = ?', [ 1111, 2222 ], ( err, rows ) => {

        rows.length.should.equal( 1 );

        _.pick( rows[ 0 ], [ 'agenda_uid', 'event_uid' ] ).should.eql( {
          agenda_uid: 1111,
          event_uid: 2222
        } );

        done();

      } );

    } );

  } );

  it( 'simple create forcing timestamp values', async () => {

    let createdAt = new Date( '2017-02-28T08:00:00.000Z' );

    let updatedAt = new Date( '2017-03-28T08:00:00.000Z' ); 

    let result = await svc( 62792452 ).create( 3333, {
      featured: true,
      state: 2,
      createdAt,
      updatedAt
    }, { protected: false } );

    result.created.createdAt.toString().should.equal( createdAt.toString() );

    result.created.updatedAt.toString().should.equal( updatedAt.toString() );

  } );


  it( 'set userUid value in second create argument', async () => {

    let result = await svc( 1212 ).create( 3434, {
      userUid: 5656
    } );

    result.created.userUid.should.equal( 5656 );

  } );

} );