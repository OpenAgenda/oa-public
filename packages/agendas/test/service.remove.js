"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' ),

mysql = require( 'mysql' );

describe( 'service.remove', function() {

  this.timeout( 30000 );

  before( () => {
    svc.init( config );
  } );

  before( svc.test.fixtures );

  afterEach( () => {

    // reset interfaces
    svc.init( config );

  } );

  it( 'agenda remove removes db entry', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select id from ${config.schemas.agenda} where id = ?`, 4875, ( err, rows ) => {

      rows.length.should.equal( 1 );

      svc.remove( 4875, ( err, result ) => {

        should( err ).equal( null );

        con.query( `select id from ${config.schemas.agenda} where id = ?`, 4875, ( err, rows ) => {

          rows.length.should.equal( 0 );

          con.end();

          done();

        } );

      } );

    } );

  } );


  it( 'agenda remove calls interface callback beforeRemove and onRemove', done => {

    // do this as part of unique init
    svc.init( Object.assign( {}, config, {
      interfaces: {
        beforeRemove: ( agenda, cb ) => {

          agenda.id.should.equal( 4830 );

          cb();

        },
        onRemove: agenda => {

          agenda.id.should.equal( 4830 );

          done();

        }
      }
    } ) );

    svc.remove( 4830, () => {} );

  } );

} );