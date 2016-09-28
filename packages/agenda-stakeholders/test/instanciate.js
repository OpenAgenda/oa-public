"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

var config = require( '../testconfig' ),

fixtures = require( './fixtures' ),

service = require( '../service' ),

mysql = require( 'mysql' );

describe( 'agenda-stakeholders', () => {

  describe( 'instanciate', function() {

    this.timeout( 60000 );

    before( done => {

      fixtures.init( config );

      fixtures( done );

    } );

    before( done => {

      service.init( config, done );

    } );

    before( done => {

      service( 4608 ).settings.clear( false, done );

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


    it( 'setFieldValues - gives errors if input is not valid', done => {

      service( 4608 ).get( { userId: 7795 }, { instanciate: true }, ( err, instance ) => {

        instance.setFieldValues( {
          organization: 'OpenAgenda',
          contact_number: '012345',
          contact_position: 'Guinea Pig'
        }, ( err, result ) => {

          return done();

          should( err ).equal( null );

          result.should.eql( {
            success: false,
            valid: false,
            errors: [ {
              code: 'string.tooshort',
              field: 'somefield',
              message: 'the string is too short',
              values: {
                max: 100,
                min: 2
              },
              origin: undefined
            } ]
          } );

          done();

        } );

      } );

    } );


    it( 'setFieldValues - forcing invalid input writes it to db anyways', done => {

      service( 4608 ).get( { userId: 7795 }, { instanciate: true }, ( err, instance ) => {

        instance.setFieldValues( {
          organization: 'OpenAgenda',
          contact_number: '012345',
          contact_position: 'Guinea Pig'
        }, { force: true }, ( err, result ) => {

          return done();

          should( err ).equal( null );

          result.should.eql( {
            success: true,
            valid: false,
            errors: [ {
              code: 'string.tooshort',
              field: 'somefield',
              message: 'the string is too short',
              values: {
                max: 100,
                min: 2
              },
              origin: undefined
            } ]
          } );

          let con = mysql.createConnection( config.mysql );

          con.query( `select * from ${config.schemas.stakeholder} where user_id = ? and review_id = ?`, [ 7795, 4608 ], ( err, rows ) => {

            let store = JSON.parse( rows[ 0 ].store );

            con.end();

            store.custom_fields.should.eql( {
              organization: { label: 'OpenAgenda', slug: 'openagenda' },
              contact_number: '012345',
              contact_position: 'Guinea Pig'
            } );

            done();

          } );

        } );

      } );

    } );


    it( 'setFieldValues - updates existing stakeholder when valid', done => {

      service( 4608 ).get( { userId: 7795 }, { instanciate: true }, ( err, instance ) => {

        instance.setFieldValues( {
          organization: 'OpenAgenda',
          contact_number: '012345',
          contact_name: 'Gaetan Latouche',
          contact_position: 'Guinea Pig'
        }, ( err, result ) => {

          should( err ).equal( null );

          result.valid.should.equal( true );
          result.errors.length.should.equal( 0 );
          result.success.should.equal( true );

          let con = mysql.createConnection( config.mysql );

          con.query( `select * from ${config.schemas.stakeholder} where user_id = ? and review_id = ?`, [ 7795, 4608 ], ( err, rows ) => {

            let store = JSON.parse( rows[ 0 ].store );

            store.custom_fields.should.eql( {
              organization: { label: 'OpenAgenda', slug: 'openagenda' },
              contact_number: '012345',
              contact_name: 'Gaetan Latouche',
              contact_position: 'Guinea Pig'
            } );

            con.end();

            done();

          } );

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
            code: 'required',
            message: 'value must not be empty' 
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