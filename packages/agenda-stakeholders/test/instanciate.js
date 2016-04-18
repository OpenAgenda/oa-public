"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

var config = require( '../testconfig' ),

fixtures = require( './fixtures' ),

service = require( '../service' );

describe( 'agenda-stakeholders', () => {

  describe( 'instanciate', function() {

    this.timeout( 10000 );

    before( done => {

      fixtures.init( config );

      fixtures( done );

    } );

    before( done => {

      service.init( config, done );

    } );

    before( done => {

      service( 4608 ).settings.clear( done );

    } );

    it( 'instanciation through get', done => {

      service( 4608 ).get( { userId: 7795 }, { instanciate: true }, ( err, instance ) => {

        should( err ).equal( null );

        should( typeof instance.isValid ).equal( 'function' );

        done();

      } );

    } );

    
    it( 'getFieldValues', done => {

      service( 4608 ).get( { userId: 7795 }, { instanciate: true }, ( err, instance ) => {

        instance.getFieldValues( ( err, fields ) => {

          fields.should.eql( {
            organization: 'Hôtel de Sambucy - 12100 - Millau',
            contact_number: '03 85 86 92 82',
            contact_name: 'de Sambucy de Sorgue Marc',
            contact_position: 'Propriétaire' 
          } );
          
          done();

        } );

      } );

    } );



    it( 'isValid - does not pass', done => {

      service( 4608 ).get( { userId: 7604 }, { instanciate: true }, ( err, instance ) => {

        instance.isValid( ( err, is, errors ) => {

          should( err ).equal( null ),

          is.should.equal( false );

          errors.should.eql( [ {
            origin: undefined,
            field: 'contact_number',
            code: 'phone.invalid',
            message: 'value is not a phone number' 
          } ] )

          done();

        } );

      } );

    } );

    it( 'isValid - passes', done => {

      service( 4608 ).get( { userId: 7795 }, { instanciate: true }, ( err, instance ) => {

        instance.isValid( ( err, is, errors ) => {

          should( err ).equal( null );

          is.should.equal( true );

          errors.length.should.equal( 0 );

          done();

        } );

      } );

    } );

    

  } );

} )