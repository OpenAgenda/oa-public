"use strict";

process.env.NODE_ENV = 'test';

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );

describe( 'agenda-stakeholders - functional (server): increment', function() {

  // pour la turbobécane de kevin
  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  it( 'increment counter field', done => {

    service.agenda( 4608 ).increment( {
      id: 9197
    }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true ); 

      done();

    } );

  } );

  it( 'callback is optional', () => {

    service.agenda( 4608 ).increment( { id: 9197 } );

  } );

  it( 'increment actually increments', done => {

    service.agenda( 4608 ).increment( { id: 6976 }, err => {

      service.agenda( 4608 ).get( { id: 6976 }, ( err, st ) => {

        st.actionsCounter.should.equal( 1 );

        service.agenda( 4608 ).increment( { id: 6976 }, err => {

          service.agenda( 4608 ).get( { id: 6976 }, ( err, st ) => {

            st.actionsCounter.should.equal( 2 );

            done();

          } );

        } );

      } );

    } );

  } );

  it( 'update does not impact increment', done => {

    service.agenda( 4608 ).get( { id: 6478 }, ( err, st ) => {

      st.actionsCounter.should.equal( 12 );

      service.agenda( 4608 ).update( { id: 6478 }, { email: 'grut@zorg.com' }, { allowPartial: true }, ( err, result ) => {

        service.agenda( 4608 ).get( { id: 6478 }, ( err, st ) => {

          st.actionsCounter.should.equal( 12 );

          done();

        } );

      } );

    } );


  } );

} );