"use strict";

const should = require( 'should' );

var config = require( '../testconfig' ),

mysql = require( 'mysql' ),

defaultFields = require( '../iso/defaults' ).fields,

// proxy of service for tests.
service = require( './service' ),

async = require( 'async' );

describe( 'agenda-stakeholders - functional (server): settings', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );


  it( 'gets settings from stakeholder settings schema', done => {

    service( 4609 ).settings.get( ( err, data ) => {

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

    service( 4611 ).settings.set( data, err => {

      let con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.stakeholderSettings} where id = ?`, 4611, ( err, rows ) => {

        rows[ 0 ].store.should.equal( '{"fields":[{"field":"somenewfield","type":"text","params":{"min":10,"max":150}}]}' );

        done();

      } );

    } );

  } );


  it( 'gets settings from legacy agenda store', done => {

    service( 4608 ).settings.get( ( err, data ) => {

      should( err ).equal( null );

      [ 'organization', 'contact_name', 'contact_position' ].forEach( field => {

        data.fields.filter( f => f.field == field ).length.should.equal( 1 );

      } );

      done();

    } );

  } );


  it( 'set default values to agenda settings', done => {

    let con = mysql.createConnection( config.mysql );

    return async.waterfall( [
      wcb => {

        con.query( `select * from ${config.schemas.agenda} where id = ?`, 4610, ( err, rows ) => {

          should( JSON.parse( rows[ 0 ].store ).cFields ).equal( undefined );

          wcb();

        } );

      },
      wcb => {

        con.query( `select * from ${config.schemas.stakeholderSettings} where id = ?`, 4610, ( err, rows ) => {

          rows.length.should.equal( 0 );

          wcb();

        } );

      },
      wcb => {

        service( 4610 ).settings.setDefault( wcb );

      },
      wcb => {

        con.query( `select * from ${config.schemas.agenda} where id = ?`, 4610, ( err, rows ) => {

          JSON.parse( rows[ 0 ].store ).cFields.should.eql( {
            organization: [],
            contact_number: [],
            contact_name: [],
            contact_position: [],
            email: [] 
          } );

          wcb();

        } );

      },
      wcb => {

        con.query( `select * from ${config.schemas.stakeholderSettings} where id = ?`, 4610, ( err, rows ) => {

          JSON.parse( rows[ 0 ].store ).fields

          .should.eql( defaultFields );

          wcb();

        } );

      }
    ], done );

  } );


  it( 'validates custom values', done => {

    service( 4608 ).settings.custom.validate( {
      email: 'asyoufallthrough@thethinice.com',
      organization: 'DRAC ALPC',
      contact_number: '05 57 95 01 84',
      contact_name: 'DEYRES Joëlle',
      contact_position: 'coordination régionale manifestations patrimoine'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.errors.length.should.equal( 0 );

      done();

    } );

  } );

} );