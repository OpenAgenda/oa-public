"use strict";

var creds = require( './lib/creds'),

should = require( 'should' ),

ifc = require( '../lib/interface' );

describe( 'GenerateAuthentification', function() {

  it( 'should give authentification error', function( done ) {

    ifc.GenerateAuthentification( {
      login: 'unknown login', 
      password: 'qfdsqfds'
    }, function( err, result ) {

      should( err ).equal( null );

      result.status.should.equal( 'BAD_LOGIN_OR_PASSWORD' );

      result.token.should.equal( '' );

      done();

    } );

  });

  it( 'should authenticate', function( done ) {

    ifc.GenerateAuthentification( {
      login: creds.login,
      password: creds.password
    }, function( err, result ) {

      should( err ).equal( null );

      result.status.should.equal( 'SUCCESS' );

      done();

    });

  });

} );

describe( 'authenticate, create and delete lists', function() {

  var token;

  before( function( done ) {

    ifc.GenerateAuthentification( {
      login: creds.login, 
      password: creds.password 
    }, function( err, result ) {

      token = result.token;

      done();

    });

  });

  it( 'GenerateAuthentification: token should be in hand', function( done ) {

    should.ok( token );

    done();

  });

  it( 'SaveList/DeleteListById: create & delete a list', function( done ) {

    ifc.SaveList( {
      token: token,
      listVO: {
        name: 'Test List',
        fieldList: [{
          fieldName: 'title',
          fieldLabel: 'TITLE'
        }, { 
          fieldName: 'description',
          fieldLabel: 'DESCRIPTION'
        } ]
      }
    }, function( err, listId ) {

      should( typeof listId ).equal( 'number' );

      ifc.DeleteListByID( {
        listID: listId,
        token: token
      }, function( err, response ) {

        response.should.equal( 'SUCCESS' );

        done();

      });

    });

  });

});

describe( 'get list, handle content', function() {

  var token, listId;

  before( function( done ) {

    ifc.GenerateAuthentification( {
      login: creds.login, 
      password: creds.password 
    }, function( err, result ) {

      token = result.token;

      done();

    });

  });

  beforeEach( function( done ) {

    ifc.SaveList( {
      token: token,
      listVO: {
        name: 'Test List',
        fieldList: [{
          fieldName: 'uid',
          fieldLabel: 'UID'
        },{
          fieldName: 'title',
          fieldLabel: 'TITLE'
        }, { 
          fieldName: 'description',
          fieldLabel: 'DESCRIPTION'
        } ]
      }
    }, function( err, id ) {

      listId = id;

      done();

    } );

  });

  afterEach( function( done ) {

    ifc.DeleteListByID( {
      listID: listId,
      token: token
    }, function( err, response ) {

      done();

    });

  });

  it( 'GetListByID', function( done ) {

    ifc.GetListByID( { listID: listId, token: token }, function( err, response ) {

      response.dynamicContentListsID.should.eql( listId );

      done();

    } );

  });

  it( 'SaveListItem', function( done ) {

    ifc.SaveListItem( {
      listID: listId,
      token: token,
      item: [ 1, 'an entry', 'this is an entry' ]
    }, function( err, response ) {

      

      done();

    } );

  });

});