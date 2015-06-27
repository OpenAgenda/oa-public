"use strict";

var utils = require( 'utils' ),

ifc = require( './interface' ),

task = require( './task' );

module.exports = function( data ) {

  var list = utils.extend( {
    clear: clear,
    removeItem: removeItem,
    setItem: setItem,
    remove: remove,
    getCount: getCount
  }, data );

  return list;

  
  /**
   * list is deleted and re-created
   */
  
  function clear( cb ) {

    if ( !cb ) {

      return task.queue( {
        name: 'clear',
        accountId: list.account.id,
        listId: list.id
      } );

    }

    list.account.removeList( list.id, function( err ) {

      if ( err ) return cb( err );

      list.account.createList( list.name, list.fields, function( err, newList ) {

        if ( err ) return cb( err );

        list.id = newList.id;

        cb( null );

      })

    });

  }

  function remove( cb ) {

    ifc.DeleteListByID( {
      token: list.token,
      listID: list.id
    }, cb );

  }

  function removeItem( id, cb ) {

    if ( cb ) {

      ifc.DeleteListItemByKey( {
        token: list.token,
        listID: list.id,
        itemKey: id
      }, cb );

    } else {

      task.queue( {
        name: 'removeItem',
        accountId: list.account.id,
        listId: list.id,
        id: id
      } );

    }    

  }

  function getCount( cb ) {

    ifc.GetListByID( {
      token: list.token,
      listID: list.id
    }, function( err, data ) {

      if ( err ) return cb( err );

      cb( null, parseInt( data.totalRecords, 10 ) );

    });

  }

  function setItem( id, data, cb ) {

    if ( !cb ) {

      return task.queue( {
        name: 'setItem',
        accountId: list.account.id,
        listId: list.id,
        id: id,
        data: data
      } );

    }

    var clean = utils.extend( { id: id }, data ),

    entry = list.fields.map( function( f ) {

      return clean[ f ] ? clean[ f ] : '';

    });

    ifc.SaveListItem( {
      listID: list.id,
      token: list.token,
      item: entry
    }, function( err, result ) {

      if ( err ) return cb( err );

      if ( result !== 'SUCCESS' ) return cb( null, false );

      return cb( null, id );

    } );
    
  }

}