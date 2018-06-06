"use strict";

const should = require( 'should' ),

format = require( '../src/service/customFormat' );

describe( 'agenda-stakeholders - unit (server) - customFormat', () => {

  describe( 'exported', () => {

    let settings = {
      fields: [ {
        field: 'organization',
        type: 'text',
        slugged: true,
      }, {
        field: 'full_name',
        type: 'text'
      } ]
    };

    it( 'getFieldValues - with field load', () => {

      format.getFieldValues( {
        organization: 'DRAC',
        full_name: 'Billy'
      }, settings )

      .should.eql( {
        organization: 'DRAC',
        full_name: 'Billy'
      } );

    } );


    it( 'getFieldValues - with value load', () => {

      format.getFieldValues( {
        organization: { slug: 'drac', label: 'DRAC' },
        full_name: 'Steve'
      }, settings )

      .should.eql( {
        organization: 'DRAC',
        full_name: 'Steve'
      } );

    } );


    it( 'getValues - with field load', () => {

      format.getValues( {
        organization: 'DRAC',
        full_name: 'Billy'
      }, settings )

      .should.eql( {
        organization: {
          slug: 'drac',
          label: 'DRAC'
        },
        fullName: 'Billy'
      } );

    } );


    it( 'getValues - with value load', () => {

      format.getValues( {
        organization: { slug: 'drac', label: 'DRAC' },
        fullName: 'Jeff'
      }, settings )

      .should.eql( {
        organization: {
          slug: 'drac',
          label: 'DRAC'
        },
        fullName: 'Jeff'
      } );

    } );


  } );

  describe( 'private', () => {

    let settings = {
      fields: [ {
        field: 'organization',
        type: 'text',
        slugged: true,
      }, {
        field: 'full_name',
        type: 'text'
      } ]
    };

    it( '_areFieldValues - true if field values are given', () => {

      format.test._areFieldValues( {
        organization: 'DRAC',
        full_name: 'Bob'
      }, settings ).should.equal( true );

    } );

    it( '_areFieldValues - false if values are given', () => {

      format.test._areFieldValues( {
        organization: {
          slug: 'drac',
          label: 'DRAC'
        },
        fullName: 'Bob'
      }, settings ).should.equal( false );

    } );

  } );

} );