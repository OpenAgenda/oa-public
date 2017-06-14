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

} );