"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );
const config = require( '../testconfig' );
const mysql = require( 'mysql' );
const types = require( '../iso/credentialTypes' );

const service = require( './service' );

describe( 'agenda-stakeholders - functional (server): stats', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  it( '.agenda.stats provides stakeholder totals by credential code', done => {

    service.agenda( 4608 ).stats( ( err, stats ) => {

      stats.credentialTotals.should.eql( { 
        contributor: 508,
        administrator: 10,
        moderator: 46 
      } );

      done();

    } );

  } );

  it( '.agenda.stats gives result matching database state', done => {

    service.agenda( 4608 ).stats( ( err, stats ) => {

      let con = mysql.createConnection( config.mysql );

      con.query( `select count(id) from ${config.schemas.stakeholder} where review_id = ? and credential = ?`, [ 4608, types.get( 'moderator' ) ], ( err, rows ) => {

        con.end();

        stats.credentialTotals.moderator.should.equal( rows[ 0 ][ 'count(id)' ] );

        done();

      } ); 

    } );

  } );

  it( '.agenda stats provides total of members for a given agenda', done => {

    service.agenda( 4608 ).stats( ( err, stats ) => {

      let con = mysql.createConnection( config.mysql );

      con.query( `select count(id) from ${config.schemas.stakeholder} where review_id = ?`, 4608, ( err, rows ) => {

        con.end();

        stats.total.should.equal( rows[ 0 ][ 'count(id)' ] );

        done();

      } ); 

    } );

  } );

} );