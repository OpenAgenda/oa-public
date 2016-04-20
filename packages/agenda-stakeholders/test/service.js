"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

var config = require( '../testconfig' ),

fixtures = require( './fixtures' ),

service = require( '../service' ),

mysql = require( 'mysql' );

describe( 'agenda-stakeholders', () => {

  describe( 'service', function() {

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

    it( 'new stakeholder is not valid at save', done => {

      let instance = service( 4608 ).new( {
        userId: 123
      } );

      instance.save( ( err, result ) => {

        should( err ).equal( null );

        result.valid.should.equal( false );

        result.saved.should.equal( false );

        result.errors.length.should.equal( 4 );

        done();

      } );

    } );

    it( 'save new stakeholder when field values are set', done => {

      let con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.stakeholder} where review_id = ? and user_id = ?`, [ 4608, 456 ], ( err, rows ) => {

        rows.length.should.equal( 0 );

        let instance = service( 4608 ).new( {
          userId: 456
        } );

        instance.setFieldValues( {
          organization: 'Hôtel de Sambucy - 12100 - Millau',
          contact_number: '03 85 86 92 82',
          contact_name: 'de Sambucy de Sorgue Marc',
          contact_position: 'Propriétaire' 
        }, err => {

          // at this point stakeholder should be saved
          con.query( `select * from ${config.schemas.stakeholder} where review_id = ? and user_id = ?`, [ 4608, 456 ], ( err, rows ) => {

            rows.length.should.equal( 1 );

            con.end();

            done();

          } );

        } );

      } );

    } );

    it( 'new stakeholder is valid and saved', done => {

      let instance = service( 4608 ).new( {
        userId: 123
      } );

      instance.setFieldValues( {
        organization: 'Hôtel de Sambucy - 12100 - Millau',
        contact_number: '03 85 86 92 82',
        contact_name: 'de Sambucy de Sorgue Marc',
        contact_position: 'Propriétaire' 
      }, { save: false }, err => {

        let con = mysql.createConnection( config.mysql );

        con.query( `select * from ${config.schemas.stakeholder} where review_id = ? and user_id = ?`, [ 4608, 123 ], ( err, rows ) => {

          // not created yet
          rows.length.should.equal( 0 );

          instance.save( ( err, result ) => {

            should( err ).equal( null );

            result.saved.should.equal( true );

            con.query( `select * from ${config.schemas.stakeholder} where review_id = ? and user_id = ?`, [ 4608, 123 ], ( err, rows ) => {

              // created
              rows.length.should.equal( 1 );

              rows[ 0 ].id.should.equal( result.stakeholder.id );

              con.end();

              done();

            } );

          } );

        } );

      } );

    } );

  } );

} );