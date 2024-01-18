"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

const actions = {
  setToEnglish: cb => cb( true )
};

describe( 'invitations - functional (server): assign an action to an invitation', function () {

  this.timeout( 20000 );

  before( 'init and load', done => {

    service.initAndLoad( Object.assign( {}, config, { actions } ), done );

  } );

  it( 'assigning an action to an inexistent invitation creates it', done => {

    service.assign( { email: 'kevin.bertho@openagenda.com' }, 'setToEnglish' )
      .then( result => {

        should( result.success ).equal( true );
        should( result.errors.length ).equal( 0 );
        should( result.invitation.data ).eql( {
          nextId: 1,
          actions: [ { id: 1, name: 'setToEnglish', params: [] } ]
        } );

        done();

      } )
      .catch( done );

  } );

  it( 'works with callback too', done => {

    service.assign( { email: 'kevin@bertho.com' }, 'setToEnglish', ( err, result ) => {

      should( err ).equal( null );
      should( result.success ).equal( true );
      should( result.errors.length ).equal( 0 );
      should( result.invitation.data ).eql( {
        nextId: 1,
        actions: [ { id: 1, name: 'setToEnglish', params: [] } ]
      } );

      done();

    } );

  } );

  it( 'assigning an action to an invitation with params', done => {

    service.assign( { email: 'kaore.olafsson@gmail.com' }, 'setToEnglish', [ [ 'an', 'array', 'first' ], 42 ] )
      .then( result => {

        should( result.success ).equal( true );
        should( result.errors.length ).equal( 0 );
        should( result.invitation.data ).eql( {
          nextId: 1,
          actions: [ { id: 1, name: 'setToEnglish', params: [ [ 'an', 'array', 'first' ], 42 ] } ]
        } );

        done();

      } )
      .catch( done );

  } );

  it( 'cannot assign an action to an inexistent invitation without specifing email', done => {

    service.assign( { token: 'mabite' }, 'setToEnglish' )
      .then( ( result ) => {

        should( result.success ).equal( false );
        should( result.errors.length ).equal( 1 );
        result.errors[ 0 ].code.should.eql( 'invitation.notFound' );

        done();

      } )
      .catch( done );

  } );

  it( 'cannot assign an action that not exists', done => {

    service.assign( { email: 'kevin.bertho@gmail.com' }, 'notExists' )
      .then( result => {

        should( result.success ).equal( false );
        should( result.errors.length ).equal( 1 );
        result.errors[ 0 ].code.should.eql( 'action.notFound' );

        done();

      } )
      .catch( done );

  } );

  it( 'onAssign receive Invitation instance and action', done => {

    const conf = Object.assign( {}, config, { actions } );
    conf.interfaces.onAssign = (action, Invitation, cb) => {

      should( action ).eql( { id: 1, name: 'setToEnglish', params: [ [ 'an', 'array', 'first' ], 42 ] } );
      cb();

    };

    service.initAndLoad( conf, err => {

      should( err ).equal( undefined );

      service.assign( { email: 'kaore.olafsson@gmail.com' }, 'setToEnglish', [ [ 'an', 'array', 'first' ], 42 ] )
        .then( result => {

          should( result.success ).equal( true );
          should( result.errors.length ).equal( 0 );
          done();

        } )
        .catch( done );

    } );

  } );

} );
