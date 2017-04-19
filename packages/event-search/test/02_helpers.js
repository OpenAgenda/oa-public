"use strict";

const should = require( 'should' );
const helpers = require( '../service/helpers' );
const service = require( '../' );
const elasticsearch = require( 'elasticsearch' );
const config = require( '../testconfig' );
const w = require( 'when' );
const async = require( 'async' );
const _ = require( 'lodash' );

describe( 'event-search - unit: helpers', function() {

  let client;

  before( () => {

    service.init( config );

    client = service.getClient();

  } );

  describe( 'createIndexName', () => {

    it( 'created index name contains alias name and current datetime ( name_20170321T1128 )', () => {

      let aliasName = 'name';

      ( new RegExp( '^' + aliasName + '_20[0-9][0-9][0-1][1-9][0-3][0-9]t[0-2][0-9][0-5][0-9]$' ) )

        .test( helpers.createIndexName( aliasName ) ).should.equal( true );

    } );

  } );


  describe( 'Alias & index handlers', done => {

    beforeEach( done => {

      client.indices.create( { index: 'test_index' }, done );

    } );

    afterEach( done => {

      client.indices.delete( { index: 'test_index' }, () => done() );

    } );

    beforeEach( done => {

      client.indices.deleteAlias( {
        index: 'test_index', 
        name: 'test_alias' 
      }, ( err, result ) => {

        done();

      } );

    } );

    describe( 'removeIndex', () => {

      it( 'if no index is specified in target namespace, do nothing', done => {

        w( {
          process: { currentIndex: null },
          client
        } )

        .then( helpers.removeIndex.bind( null, 'process.currentIndex' ) )

        .done( v => {

          client.indices.get( { index: 'test_index' }, ( err, result ) => {

            Object.keys( result ).should.eql( [ 'test_index' ] );

            done();

          } );

        } );

      } );

      it( 'if an index is specified in target namespace, remove', done => {

        w( {
          process: { currentIndex: 'test_index' },
          client
        } )

        .then( helpers.removeIndex.bind( null, 'process.currentIndex' ) )

        .done( v => {

          client.indices.get( { index: 'test_index' }, ( err, result ) => {

            should( err && err.status === 404 ).equal( true );

            done();

          } );

        } );

      } );

    } );


    describe( 'reassociateAlias', () => {

      beforeEach( done => {

        client.indices.create( { index: 'test_index_2' }, done );

      } );

      afterEach( done => {

        client.indices.getAlias( { name: 'test_alias' }, ( err, result ) => {

          async.eachSeries( Object.keys( result ), ( indexName, ecb ) => {

            client.indices.delete( { index: indexName }, err => ecb() );

          }, done );

        } );

      } );

      it( 'associate alias to index specified in namespace', done => {

        w( {
          in: { alias: 'test_alias' },
          out: { indexName: 'test_index_2' },
          client
        } )

        .then( helpers.reassociateAlias.bind( null, 'in.alias', 'out.indexName' ) )

        .done( v => {

          client.indices.getAlias( { name: 'test_alias' }, ( err, result ) => {

            Object.keys( result ).length.should.equal( 1 );

            Object.keys( result )[ 0 ].should.equal( 'test_index_2' );

            done();

          } );

        } );

      } )

    } );

    describe( 'readIndexName', done => {

      it( 'if alias points to nothing, do nothing', done => {

        w( {
          in: { alias: 'unit_alias' },
          process: { currentIndex: null },
          client
        } )

        .then( helpers.readIndexName.bind( null, 'in.alias', 'process.currentIndex' ) )

        .done( v => {

          should( v.process.currentIndex ).equal( null );

          done();

        } );

      } )

      it( 'if alias points to index, save to given namespace', done => {

        w( {
          in: { alias: 'unit_alias' },
          process: { currentIndex: null },
          client
        } )

        .then( v => {

          let d = w.defer();

          client.indices.putAlias( { 
            name: v.in.alias, 
            index: 'test_index' 
          }, ( err, response ) => {

            d.resolve( v );

          } );

          return d.promise;

        } )

        .then( helpers.readIndexName.bind( null, 'in.alias', 'process.currentIndex' ) )

        .done( v => {

          v.process.currentIndex.should.equal( 'test_index' );

          done();

        } );

      } );

    } );

  } );


} );