"use strict";

const settings = {
  res: 'https://taas.reverso.net/riws/RestTranslation.svc/v1/output=json/TranslateText'
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

  return function translate( text, lang, destLang, cb ) {

    if ( arguments.length === 3 ) {

      cb = destLang;
      destLang = lang;
      lang = 'fr';

    }

    if ( !_.isArray( destLang ) ) {

      return singleTranslate( text, lang, destLang, cb );

    }

    let translations = {};

    return async.eachSeries( destLang, ( l, ecb ) => {

      singleTranslate( text, lang, l, ( err, translation ) => {

        if ( err ) return ecb( err );

        translations[ l ] = translation;

        ecb();

      } );

    }, err => {

      if ( err ) return cb( err );

      cb( null, translations );

    } );

  }


  function singleTranslate( text, lang, destLang, cb ) {

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

        let cleanResponse = res.body.TranslatedText

          // take away html wrappers
          .replace( /^(\s+|)Html\s>\s<bodysuit>|< \/ html > < \/ bodysuit >(\s+|)$/g, '' )

          // take away <Html <body>> type wrappers
          .replace( /^<Html <body>>| <\/html> <\/body>$/g, '' )

          // remove inserted id tgs
          .replace( /< h[1-8] id = "(\s|)([a-z]|\-)+(\s|)" >/g, match => '< h' + match[ 3 ] + ' >' )

          // remove spaces in opening and closing tags
          .replace( /(\s|)<(\s|)(\/|)(\s|)(p|h[1-8]|a|span|div|ul|li)(\s|)>(\s|)/g, match => match.replace( /\s/g, '' ) );

        if ( err ) return cb( err );

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