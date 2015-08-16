"use strict";

var utils = require( 'utils' ),

ifc = require( './interface' ),

task = require( './task' ),

logger = require( './logger' ), log;

module.exports = function( data ) {

  log = logger( 'list' );

  var list = utils.extend( {
    clear: clear,
    setState: setState,
    getState: getState,
    getFields: getFields,
    removeItem: removeItem,
    setItem: setItem,
    remove: remove,
    getCount: getCount
  }, data );

  return list;

  
  /**
   * list is deleted and re-created
   */
  
  function clear( newState, fields, cb ) {

    if ( arguments.length == 2 && utils.isArray( arguments[ 0 ] ) ) {

      cb = fields;

      fields = newState;

      newState = false;

    } else if ( arguments.length == 2 ) {

      cb = fields;

      fields = list.fields;

    } else if ( arguments.length == 1 && typeof arguments[ 0 ] == 'function' ) {

      cb = newState;

      newState = false;

      fields = list.fields;

    } else if ( arguments.length == 0 ) {

      newState = false;

      fields = list.fields;

    }

    log( 'clear' );

    list.account.removeList( list.id, function( err ) {

      if ( err ) return cb( err );

      log( 'clear - list %s removed', list.id );

      list.account.createList( list.name, fields, function( err, newList ) {

        if ( err ) return cb( err );

        log( 'clear - list %s created', newList.id );

        list.id = newList.id;
        list.fields = newList.fields;

        setState( newState, cb );

      });

    });

  }

  function getState() {

    return list.state;

  }

  function getFields() {

    return list.fields;

  }

  function setState( state, cb ) {

    if ( !cb ) {

      task.queue( {
        name: 'setState',
        accountId: list.account.id,
        listId: list.id,
        state: state
      } );

      return;

    }

    log( 'setState - setting list %s state to %s', list.id, state );

    list.account.updateList( list.id, { state: state }, cb );

  }

  function remove( cb ) {

    log( 'remove - list %s with token %s', list.id, list.token );

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

      if ( !data ) return cb( null, null );

      cb( null, parseInt( data.totalRecords, 10 ) );

    });

  }

  function setItem( id, data, cb ) {

    if ( !cb ) {

      log( 'setItem - callback not defined, queuing for list %s', list.id );

      return task.queue( {
        name: 'setItem',
        accountId: list.account.id,
        listId: list.id,
        id: id,
        data: data
      } );

    }

    log( 'setItem' );

    var clean = utils.extend( { id: id }, data ),

    entry = list.fields.map( function( f ) {

      return clean[ f ] ? clean[ f ] : '';

    });

    log( 'setItem - saving in list %s entry %s', list.id, entry );

    ifc.SaveListItem( {
      listID: list.id,
      token: list.token,
      item: entry
    }, function( err, result ) {

      if ( err ) {

        log( 'setItem - error %s', err );

        return cb( err );

      }

      if ( result !== 'SUCCESS' ) {

        log( 'setItem - not successful %s', result );

        return cb( null, false );

      }

      log( 'setItem - ok' );

      return cb( null, id );

    } );
    
  }

}