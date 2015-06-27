"use strict";

var utils = require( 'utils' ),

list = require( './list' ),

store = require( './store' ),

ifc = require( './interface' );

module.exports = function( data ) {

  var token,

  account = utils.extend( {
    update: update,
    createList: createList,
    removeList: removeList,
    getList: getList,
    unlink: unlink
  }, data );

  return account;

  function unlink( cb ) {

    getList( function( err, list ) {

      if ( err ) return cb( err );

      removeList( function( err ) {

        if ( err ) return cb( err );

        _del( cb );

      });

    } );

  }

  function removeList( listId, cb ) {

    if ( arguments.length == 1 ) {

      cb = listId;

      listId = account.lists.length ? account.lists[ 0 ].id : false;

    }

    getList( listId, function( err, list ) {

      if ( err ) return cb( err );

      if ( !list ) {

        return cb( null, false );

      }

      list.remove( function( err, deletedId ) {

        if ( err ) return cb( err );

        var lists = account.lists.filter( function( l ) {

          return l.id !== deletedId;

        });

        update( { lists: lists }, function( err ) {

          if ( err ) return cb( err );

          cb( null, deletedId );

        } );

      });

    });

  }

  function update( toUpdate, cb ) {

    var updated = utils.extend( 
      {}, 
      data,
      toUpdate
    );

    _getToken( updated.login, updated.password, function( err, token ) {

      if ( err ) return cb( err );

      utils.extend( data, updated );

      store.set( utils.extend( {
        id: account.id
      }, toUpdate ), cb );

    } );

  }

  function createList( name, fields, cb ) {

    _getToken( data.login, data.password, function( err, token ) {

      if ( err ) return cb( err );

      ifc.SaveList( {
        token: token,
        listVO: {
          name: name
        }
      }, function( err, id ) {

        if ( err ) return cb( err );

        if ( fields[ 0 ] !== 'id' ) fields.splice( 0, 0, 'id' );

        ifc.InsertListContent( {
          listID: id,
          token: token,
          listContent: [ fields.join( ';' ) ]
        }, function( err ) {

          if ( err ) return cb( err );

          data.lists.push( { 
            id: id, 
            name: name,
            fields: fields
          } );

          store.set( data, function( err ) {

            if ( err ) return cb( err );

            cb( null, list( { 
              id: id, 
              account: account,
              name: name,
              token: token,
              fields: fields
            } ) );

          } );

        } );

      });

    } );

  }

  function getList( listId, cb ) {

    var l;

    if ( arguments.length == 1 ) {

      cb = listId;

      listId = data.lists.length ? data.lists[ 0 ].id : false;

    }

    if ( !listId ) return cb( null, null );

    l = account.lists.filter( function( l ) {

      return l.id == listId;

    } )[ 0 ];

    _getToken( function( err, token ) {

      if ( err ) return cb( err );

      cb( null, list( {
        id: listId,
        name: l.name,
        account: account,
        token: token,
        fields: l.fields
      } ) );

    });

  }

  function _getToken( cb ) {

    var login, password;

    if ( arguments.length == 1 ) {

      login = account.login;

      password = account.password;

    } else {

      login = arguments[ 0 ];

      password = arguments[ 1 ];

      cb = arguments[ 2 ];

    }

    ifc.GenerateAuthentification( {
      login: login,
      password: password
    }, function( err, result ) {

      if ( err ) return cb( err );

      if ( result.status !== 'SUCCESS' ) return cb( null, false );

      cb( null, result.token );

    } );

  }

  function _del( cb ) {

    store.del( account.id, cb );

  }

}