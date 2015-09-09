"use strict";

var utils = require( 'utils' ),

http = require( 'http' ),

config = require( '../config' ),

parseString = require( 'xml2js' ).parseString;

module.exports = {
  GenerateAuthentification: GenerateAuthentification,
  GetListByID: GetListByID,
  SaveList: SaveList,
  InsertListContent: InsertListContent,
  DeleteListContent: DeleteListContent,
  DeleteListByID: DeleteListByID,
  SaveListItem: SaveListItem, // first item serves as key
  DeleteListItemByKey: DeleteListItemByKey
}

function GetListByID( data, cb ) {

  _request( 'GetListByID', 'post', utils.extend( {
    token: false, // required
    listID: false // required
  }, data ), cb );

}

function DeleteListByID( data, cb ) {

  _request( 'DeleteListByID', 'post', utils.extend( {
    token: false, // required
    listID: false // required
  }, data ), cb );

}

function InsertListContent( data, cb ) {

  var clean = utils.extend( {
    token: false,  // required
    listID: false, // required
    listContent: false, // required
  }, data );

  clean.listContent = _wrapList( clean.listContent, 'string' );

  _request( 'InsertListContent', 'post', clean, cb );

}

function DeleteListContent( data, cb ) {

  var clean = utils.extend( {
    token: false,   // required
    listID: false,  // required
    listContent: false // required. list of semicolon separated values 
  }, data );

  clean.listContent = _wrapList( clean.listContent, 'string' );

  _request( 'DeleteListContent', 'post', clean, cb );

}

function SaveListItem( data, cb ) {

  var clean = utils.extend( {
    token: false,  // required
    listID: false, // required
    item: false    // required
  }, data );

  clean.item = _wrapList( clean.item, 'string' );

  _request( 'SaveListItem', 'post', clean, cb );

}


function DeleteListItemByKey( data, cb ) {

  _request( 'DeleteListItemByKey', 'post', utils.extend( {
    token: false,
    listID: false,
    itemKey: false
  }, data ), cb );

}

function SaveList( data, cb ) {

  var clean = utils.extend( {
    token: false, // required
    listVO: {
      name: false, // required
      dynamicContentListsID: false, // optional
      fieldList: []
    }
  }, data );

  _request( 'SaveList', 'post', clean, function( err, result ) {

    if ( err ) return cb( err );

    return cb( null, parseInt( result, 10 ) );

  } );

}

function GenerateAuthentification( data, cb ) {

  _request( 'GenerateAuthentification', 'post', utils.extend( {
    login: false,
    password: false
  }, data ), cb );

}


function _wrapList( list, fieldName, defaults ) {

  return [ fieldName, list.map( function( listItem ) {

    return typeof listItem == 'object' ? utils.extend( {}, defaults, listItem ) : listItem;

  })];

}


function _request( name, method, data, cb ) {

  var modes = {
    '1.1' : {
      elem : 'soap',
      headers : {
        'Content-Type' : 'text/xml; charset=utf-8',
        'SOAPAction': 'http://www.wewmanager.com/services/dyncont/' + name
      },
      xmlns : 'soap="http://schemas.xmlsoap.org/soap/envelope/"'
    },
    '1.2' : {
      elem : 'soap12',
      //elem: 'soapenv',
      headers : {
        'Content-Type' : 'application/soap+xml; charset=utf-8',
      },
      xmlns : 'soap12="http://www.w3.org/2003/05/soap-envelope"'
    } 
  },

  soap = modes[ '1.2' ],

  soapData = [ 
    '<?xml version="1.0" encoding="utf-8"?>',
    '<', soap.elem, ':Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:', soap.xmlns,'>',
      '<', soap.elem, ':Body>',
        '<', name, ' xmlns="http://www.wewmanager.com/services/dyncont/">'
  ],

  req;

  for( var i in data ) {

    soapData.push( _parse( i, data[ i ] ) );

  }

  soapData.push( '</', name, '>', '</', soap.elem, ':Body>', '</', soap.elem, ':Envelope>' );

  soapData = soapData.join( '' );

  soap.headers[ 'Content-Length' ] = soapData ? Buffer.byteLength( soapData ) : 0;

  req = http.request({
    host: config.host,
    port: config.port,
    path: config.path,
    method: method,
    headers: soap.headers
  }, function( res ) {

    var response = '';

    res.setEncoding( 'utf8' );

    res.on( 'data', function ( chunk ) {

      response += chunk;

    });

    res.on( 'end', function() {
      
      //console.log('GETTING');
      //console.log( response );

      parseString( response, function ( err, result ) {

        var parsed;

        if ( err ) return cb( err );

        try {

          parsed = result[ 'soap:Envelope' ][ 'soap:Body' ][ 0 ][ name + 'Response' ][ 0 ][ name + 'Result' ];

          if ( parsed === undefined ) {

            parsed = null;

          } else {

            parsed = parsed[ 0 ];

            for( i in parsed ) {

              parsed[ i ] = parsed[ i ][ 0 ];

            }

          }

        } catch( e ) {

          cb( 'could not extract result: ' + response + ' / error received: ' + e );

          return;

        }

        cb( null, parsed );

      });

    });

  } );

  //console.log('WRITING');
  //console.log( soapData );

  req.write( soapData );

  req.end();

}

function _parse( key, item, leaf ) {

  if ( utils.isArray( item ) ) {

    return _parse( key, item[ 1 ].map( function( child ) {

      return _parse( item[ 0 ], child, typeof item[ 0 ] == 'string' );

    } ).join( '' ) );

  } else if ( typeof item == 'object' ) {

    var compiled = [];

    for( var i in item ) {

      compiled.push( _parse( i, item[ i ], true ) );

    }

    return _parse( key, compiled.join( '' ) );

  } else {

    var clean = item;

    if ( leaf && typeof item == 'string' ) {

      // emailStrategie does not like apostrophe
      clean = clean.replace( /\'/g, '’' );

      // emailStrategie does not like &
      clean = clean.replace( /\&/g, '&amp;' );

      //clean = '<![CDATA[' + clean + ']]>';

    }

    //return '<dyn:' + key + '>' + clean + '</dyn:' + key + '>';
    return '<' + key + '>' + clean + '</' + key + '>';

  }

}