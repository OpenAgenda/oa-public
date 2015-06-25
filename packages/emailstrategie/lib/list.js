"use strict";

var utils = require( 'utils' ),

esInt = require( './interface' );

module.exports = function( data ) {

  var id = data.id,

  accountId = data.accountId,

  token = data.token;

  return utils.extend( {
    clear: clear,
    removeItem: removeItem,
    setItem: setItem,
    remove: remove
  }, data );

  function clear( cb ) {

    esInt.DeleteListContent( {
      token: token,
      listID: id
    }, cb )

  }

  function remove( cb ) {

    esInt.DeleteListByID( {
      token: token,
      listID: id
    }, cb );

  }

  function removeItem( itemId, cb ) {

    esInt.DeleteListItemByKey( {
      token: token,
      listID: id,
      itemKey: itemId
    }, cb );

  }

  function setItem( itemId, data, cb ) {

    esInt.SaveListItem( utils.extend( { id: itemId }, data ), cb );
    
  }

}