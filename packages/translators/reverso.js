"use strict";

const settings = {
  res: 'https://taas.reverso.net/riws/RestTranslation.svc/v1/output=json/TranslateHtml'
}

const _ = require( 'lodash' );
const request = require( 'superagent' );
const async = require( 'async' );
const sha1 = require( 'sha1' );
const crypto = require( 'crypto-browserify' );
const marked = require( 'marked' );
const toMarkdown = require( 'to-markdown' );

module.exports = options => {

  const params = _.defaults( options, {
    user: false, // required
    password: false // required
  } );

  if ( !params.user ) throw new Error( 'User is not set' );

  if ( !params.password ) throw new Error( 'Password is not set' );

  return translate; 

  function translate( text, lang, destLang, cb ) {

    if ( arguments.length === 3 ) {

      cb = destLang;
      destLang = lang;
      lang = 'fr';

    }

    if ( _.isPlainObject( text ) ) {

      return objectTranslate( text, lang, destLang, cb );

    }

    if ( _.isArray( destLang ) ) {

      return multipleTextTranslate( text, lang, destLang, cb );

    }

    return singleTextTranslate( text, lang, destLang, cb );

  }


  function objectTranslate( obj, lang, destLang, cb ) {

    let translations = {};

    return async.eachSeries( Object.keys( obj ), ( key, ecb ) => {

      translate( obj[ key ], lang, destLang, ( err, translation ) => {

        if ( err ) return ecb( err );

        translations[ key ] = translation;

        ecb();

      } );

    }, err => {

      if ( err ) return cb( err );

      cb( null, translations );

    } );

  }

  function multipleTextTranslate( textArray, lang, destLang, cb ) {

    let translations = {};

    return async.eachSeries( destLang, ( l, ecb ) => {

      singleTextTranslate( textArray, lang, l, ( err, translation ) => {

        if ( err ) return ecb( err );

        translations[ l ] = translation;

        ecb();

      } );

    }, err => {

      if ( err ) return cb( err );

      cb( null, translations );

    } );

  }


  function singleTextTranslate( text, lang, destLang, cb ) {

    if ( text === null || text === '' || text === undefined ) {

      return cb( null, '' );

    }

    let created = _reversoCreated(),

    signature = crypto.createHmac( 'sha1', params.password ).update( params.user + created ).digest( 'hex' ),

    res = [ 
      settings.res + '/direction=',
      _parseLang( lang ), '-', _parseLang( destLang ),
      '?template=General&isUserTemplate=true'
    ].join( '' ),

    html = '<html><body>' + marked( text ) + '</html></body>';

    request.post( res )

      .set( 'Username', params.user )

      .set( 'Signature', signature.toUpperCase() )

      .set( 'Created', created )

      .send( html )

      .end( ( err, res ) => {

        if ( err ) return cb( err );

        let html = ( new Buffer( res.body.TranslatedHtml, 'base64' ) ).toString(),

        cleanResponse = html

          .replace( /^<base href=""><meta http-equiv="Content-Type" content="text\/html; charset=UTF-8"><HTML DIR="LTR"><body>(<p>|)/g, '' )

          .replace( /(<\/p>|)<\/html><\/body>$/g, '' );

        cb( null, toMarkdown( cleanResponse ).replace( /\n\n/g, '\n' ) );

      } );

  }

}


function _fZ( n ) {

  return ( n > 9 ? '' : '0' ) + n;

}


function _reversoCreated() {

  var now = new Date();

  return [ 
    _fZ( now.getMonth() + 1 ),
    _fZ( now.getDate() ),
    _fZ( now.getFullYear() )
  ].join( '/' )

  + ' ' + [
    _fZ( now.getHours() ),
    _fZ( now.getMinutes() ),
    _fZ( now.getSeconds() )
  ].join( ':' );

}


function _parseLang( code ) {

  return( {
    fr : 'fra',
    en : 'eng',
    it : 'ita',
    es : 'spa',
    de : 'ger',
  } )[ code ];

}