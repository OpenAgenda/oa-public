"use strict";

const settings = {
  res: 'https://taas.reverso.net/riws/RestTranslation.svc/v1/output=json/TranslateText'
}

const _ = require( 'lodash' );
const request = require( 'superagent' );
const async = require( 'async' );
const sha1 = require( 'sha1' );
const crypto = require( 'crypto-browserify' );

module.exports = options => {

  const params = _.defaults( options, {
    user: false, // required
    password: false // required
  } );

  if ( !params.user ) throw new Error( 'User is not set' );

  if ( !params.password ) throw new Error( 'Password is not set' );

  return function translate( text, lang, destLang, cb ) {

    if ( arguments.length === 3 ) {

      cb = destLang;
      destLang = lang;
      lang = 'fr';

    }

    if ( _.isArray( destLang ) ) {

      let translations = {};

      return async.eachSeries( destLang, ( l, ecb ) => {

        translate( text, lang, l, ( err, translation ) => {

          if ( err ) return ecb( err );

          translations[ l ] = translation;

          ecb();

        } );

      }, err => {

        if ( err ) return cb( err );

        cb( null, translations );

      } );

    }

    let created = _reversoCreated(),

    signature = crypto.createHmac( 'sha1', params.password ).update( params.user + created ).digest( 'hex' ),

    res = [ 
      settings.res + '/direction=',
      _parseLang( lang ), '-', _parseLang( destLang ),
      '?template=General&isUserTemplate=true'
    ].join( '' );

    request.post( res )

      .set( 'Username', params.user )

      .set( 'Signature', signature.toUpperCase() )

      .set( 'Created', created )

      .send( text )

      .end( ( err, res ) => {

        if ( err ) return cb( err );

        cb( null, res.body.TranslatedText );

      } )

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