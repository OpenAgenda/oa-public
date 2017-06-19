"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( 'events-service/test/service' );
const service = require( '../' );

describe( 'event-search - functional: rebuild', function() {

  describe( 'basic usage', function() {

    this.timeout( 10000 );

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql' 
      } ], { reset: true }, done );

    } );

    beforeEach( () => {

      service.init( config );

    } );

    describe( 'list evaluation', () => {

      it( 'if a input list is not provided, errors', done => {

        service( 'test_alias' ).rebuild( 'not a function', err => {

          err.message.should.equal( 'eventsList is not a function' );

          done();

        } );

      } );

      it( 'if list returns an error, it is encapsulated', done => {

        service( 'test_alias' ).rebuild( {
          eventsList: ( offset, limit, cb ) => cb( 'crash!' )
        }, err => {

          err.message.should.equal( 'crash!' );

          done();

        } );

      } );

    } );


    describe( 'index generation', () => {

      function eventsList( offset, limit, cb ) {
        
        events.list( offset, limit, {
          internal: true,
          detailed: true,
          private: null
        }, cb );

      }

      it( 'generated index name is given in result details', done => {

        service( 'test_alias' ).rebuild( {
          eventsList
        }, ( err, result, details ) => {

          // index will look like this: test_alias_20170327T1013
          details.indexName.substr( 0, 10 ).should.equal( 'test_alias' );

          done();

        } );

      } );

      it( 'index is effectively created', done => {

        service( 'test_alias' ).rebuild( {
          eventsList
        }, ( err, result, details ) => {

          service.getConfig().client.indices.exists( { index: details.indexName }, ( err, exists ) => {

            exists.should.equal( true );

            done();

          } );

        } );

      } );

    } );

  } );

} );