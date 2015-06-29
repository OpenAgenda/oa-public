"use strict";

var creds = require( './lib/creds'),

should = require( 'should' ),

ifc = require( '../lib/interface' ),

async = require( 'async' );

describe( 'GenerateAuthentification', function() {

  this.timeout( 10000 );

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

  this.timeout( 10000 );

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
        name: 'Test List'
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

  this.timeout( 10000 );

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

    // before list can be handled with SaveListItem,
    // columns must be declared with InsertListContent

    ifc.SaveList( {
      token: token,
      listVO: {
        name: 'Test List'
      }
    }, function( err, id ) {

      listId = id;

      ifc.InsertListContent( {
        listID: listId,
        token: token,
        listContent: [ 'id;title;description' ]
      }, function() {

        done();

      });

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

      response.totalRecords.should.eql( 0 );

      response.fieldList.DynamicContentListHeaderVO.map( function( f ) { 

        return f.fieldLabel[ 0 ];

      } )

      .should.eql( [ 'id', 'title', 'description' ] );

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

      should( err ).equal( null );

      response.should.equal( 'SUCCESS' );

      ifc.GetListByID( { listID: listId, token: token }, function( err, response ) {

        response.totalRecords.should.eql( 1 );

        done();

      } );

    } );

  });

  it.only( 'SaveListItem special character', function( done ) {

    async.each( [
      [ 1, 'La bête \t humaine', 'groar' ],
      [ 2, 'The Dynasties \n of China', 'rhhz' ],
      [ 3, 'La muraille \r\n de lave', 'glauque' ],
      [ 4, 'Les Matins de l\'emploi', 'Les métiers de l\'hotellerie : venez rencontrer des professionnels, partager expérience et points de vue.  ' ],
      [ 5, '\'\'  . \n\n      de l’hôtelle', 'Test' ]
    ], function( entry, ecb ) {

      ifc.SaveListItem( {
        listID: listId,
        token: token,
        item: entry
      }, ecb );

    }, function( err ) {

      should( err ).equal( null );

      ifc.GetListByID( { listID: listId, token: token }, function( err, response ) {

        response.totalRecords.should.eql( 1 );

        done();

      } );

    } );

  });

  it( 'DeleteListItemByKey', function( done ) {

    ifc.SaveListItem( {
      listID: listId,
      token: token,
      item: [ 1, 'an entry', 'this is an entry' ]
    }, function( err, response ) {

      ifc.DeleteListItemByKey( {
        listID: listId,
        token: token,
        itemKey: 1
      }, function( err, response ) {

        should( err ).equal( null );

        response.should.equal( 'SUCCESS' );

        ifc.GetListByID( {
          listID: listId,
          token: token
        }, function( err, response ) {

          response.totalRecords.should.eql( 0 );

          done();

        } );

      } );

    } );

  });


  // appending an extra line in selection is required
  // to fake header ( i think )
  it( 'DeleteListContent', function( done ) {

    this.timeout( 10000 );

    async.each( [
      [ 1, 'La bête humaine', 'groar' ],
      [ 2, 'The Dynasties of China', 'rhhz' ],
      [ 3, 'La muraille de lave', 'glauque' ]
    ], function( entry, ecb ) {

      ifc.SaveListItem( {
        listID: listId,
        token: token,
        item: entry
      }, ecb );

    }, function( err ) {

      should( err ).equal( null );

      ifc.GetListByID( { listID: listId, token: token }, function( err, response ) {

        response.totalRecords.should.eql( 3 );

        ifc.DeleteListContent( {
          token: token,
          listID: listId,
          listContent: [ 'header?', '1', '2', '3' ]
        }, function( err, response ) {

          ifc.GetListByID( { listID: listId, token: token }, function( err, response ) {

            response.totalRecords.should.eql( 0 );

            done();

          } );

        })

      } );

    } );

  });

});