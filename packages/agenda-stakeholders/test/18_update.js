"use strict";

process.env.NODE_ENV = 'test';

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const _ = require( 'lodash' );

describe( 'agenda-stakeholders - functional (server): update', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  describe( 'basic usage', () => {

    it( 'by default, all fields must be informed to do a successful update', done => {

      service.agenda( 4608 ).update( { 
        email: 'conservatoire@jardin.fr' 
      }, {
        email: 'jacky@papy.fr',
        contact_name: 'Jacky chez Papy',
        contact_position: 'cuistot',
        contact_number: '06',
        organization: 'Chez Papy'
      }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        result.stakeholder.id.should.equal( 7735 );

        result.stakeholder.custom.should.eql( { 
          email: 'jacky@papy.fr',
          contactName: 'Jacky chez Papy',
          contactPosition: 'cuistot',
          contactNumber: '06',
          organization: {
            label: 'Chez Papy',
            slug: 'chez-papy'
          }
        } );

        done();

      } );

    } );

    it( 'by default, if not all fields are given, update returns errors', done => {

      service.agenda( 4608 ).update( { 
        id: 9197
      }, {
        email: 'jacky@papy.fr',
        contact_name: 'Jacky chez Papy'
      }, ( err, result ) => {

        result.success.should.equal( false );

        result.valid.should.equal( false );

        result.errors.length.should.equal( 3 );

        done();

      } );

    } );

    it( 'it is only possible to perform partial updates if allowPartial option is used', done => {

      service.agenda( 4608 ).update( {
        userId: 7752
      }, {
        email: 'ines@aubout.pc'
      }, { allowPartial: true }, ( err, result ) => {

        result.success.should.equal( true );

        result.stakeholder.userId.should.equal( 7752 );

        done();

      } );

    } );

    it( 'credential is set when specified in update options', done => {

      service.agenda( 4608 ).update( {
        id: 7084
      }, {}, { 
        allowPartial: true, // nothing will change in fields as nothing was given
        credential: service.types.get( 'administrator' )
      }, ( err, result ) => {

        result.success.should.equal( true );

        result.stakeholder.credential.should.equal( service.types.get( 'administrator' ) );

        done();

      } );

    } );

  } );

} );