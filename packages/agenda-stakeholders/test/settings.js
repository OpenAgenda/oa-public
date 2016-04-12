"use strict";

const should = require( 'should' );

var config = require( '../testconfig' ),

mysql = require( 'mysql' ),

fixtures = require( './fixtures' ),

service = require( '../service' );

describe( 'agenda-stakeholders', () => {

  describe( 'settings', function() {

    this.timeout( 10000 );

    before( done => {

      fixtures.init( config );

      fixtures( done );

    } );

    before( done => {

      service.init( config, done );

    } );

    it( 'gets settings from stakeholder settings schema', done => {

      service( 4608 ).settings.get( ( err, data ) => {

        should( err ).equal( null );

        data.should.eql( {
          fields: [ {
            field: 'somefield',
            type: 'text',
            params: { min: 2, max: 100 }
          } ]
        } );

        done();

      } );

    } );

    it( 'saves settings to stakeholder schema', done => {

      let data = {
        fields: [ { field: 'somenewfield', type: 'text', params: { min: 10, max: 150 } } ]
      };

      service( 4608 ).settings.set( data, err => {

        let con = mysql.createConnection( config.mysql );

        con.query( `select * from ${config.schemas.stakeholderSettings} where id = ?`, 4608, ( err, rows ) => {

          rows[ 0 ].store.should.equal( '{"fields":[{"field":"somenewfield","type":"text","params":{"min":10,"max":150}}]}' );

          done();

        } );

      } );

    } );


    it( 'gets settings from legacy agenda store', done => {

      service( 4609 ).settings.get( ( err, data ) => {

        should( err ).equal( null );

        [ 'organization', 'contact_name', 'contact_position' ].forEach( field => {

          data.fields.filter( f => f.field == field ).length.should.equal( 1 );

        } );

        done();

      } );

    } );

  } );

})