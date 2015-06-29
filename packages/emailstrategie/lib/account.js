"use strict";

var utils = require( 'utils' ),

list = require( './list' ),

store = require( './store' ),

ifc = require( './interface' ),

log = require( './logger' )( 'account' );

module.exports = function( data ) {

  var token,

  account = utils.extend( {
    update: update,
    updateList: updateList,
    createList: createList,
    removeList: removeList,
    getList: getList,
    unlink: unlink
  }, data );

  return account;

  function unlink( cb ) {

    log( 'unlink - %s', account.id );

    getList( function( err, list ) {

      if ( err ) return cb( err );

      removeList( function( err ) {

        if ( err ) return cb( err );

        log( 'unlink - %s: removing from store', account.id );

        _del( cb );

      });

    } );

  }

  function removeList( listId, cb ) {

    if ( arguments.length == 1 ) {

      cb = listId;

      listId = account.lists.length ? account.lists[ 0 ].id : false;

    }

    log( 'removeList - %s', listId );

    getList( listId, function( err, list ) {

      if ( err ) return cb( err );

      if ( !list ) {

        log( 'removeList - %s: no list was retrieved', listId );

        return cb( null, false );

      }

      list.remove( function( err, result ) {

        if ( err ) return cb( err );

        log( 'removeList - deleted %s', result );

        var lists = account.lists.filter( function( l ) {

          return l.id !== listId;

        });
        
        update( { lists: lists }, function( err ) {

          if ( err ) return cb( err );

          cb( null, listId );

        } );

      });

    });

  }

  function update( toUpdate, cb ) {

    var updated = utils.extend({}, account, toUpdate );

    _getToken( updated.login, updated.password, function( err, token ) {

      if ( err ) return cb( err );

      utils.extend( account, updated );

      _storeSet( cb );

    } );

  }

  function _storeSet( cb ) {

    store.set( {
      id: account.id,
      login: account.login,
      password: account.password,
      lists: account.lists
    }, cb );

  }

  function updateList( id, data, cb ) {

    account.lists.forEach( function( list, i ) {

      if ( list.id == id ) {

        utils.extend( account.lists[ i ], data );

      }

    } );

    update( {
      lists: account.lists
    }, cb );

  }

  function createList( name, fields, cb ) {

    log( 'createList - creating list %s', name );

    _getToken( account.login, account.password, function( err, token ) {

      if ( err ) return cb( err );

      ifc.SaveList( {
        token: token,
        listVO: {
          name: name
        }
      }, function( err, id ) {

        if ( err ) return cb( err );

        if ( fields[ 0 ] !== 'id' ) fields.splice( 0, 0, 'id' );

        log( 'createList - initializing header %s', fields );

        ifc.InsertListContent( {
          listID: id,
          token: token,
          listContent: [ fields.join( ';' ) ]
        }, function( err ) {

          if ( err ) return cb( err );

          log( 'createList - headers created' );

          account.lists.push( { 
            id: id, 
            name: name,
            fields: fields
          } );

          _storeSet( function( err ) {

            if ( err ) return cb( err );

            log( 'createList - list stored with id %s in account %s', id, account.id );

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

      listId = account.lists.length ? account.lists[ 0 ].id : false;

    }

    if ( !listId ) return cb( null, null );

    l = account.lists.filter( function( l ) {

      return l.id == listId;

    } )[ 0 ];

    if ( !l ) {

      return cb( null, null );

    }

    _getToken( function( err, token ) {

      if ( err ) return cb( err );

      cb( null, list( {
        id: listId,
        name: l.name,
        state: l.state,
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