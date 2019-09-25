"use strict";

const settings = {
  res: 'https://api.translation.ent.reverso.net/ri6/riws/Services/RestTranslation.svc/v1/TranslateHtml'
}


const _ = {
  isPlainObject: require( 'lodash/isPlainObject' ),
  defaults: require( 'lodash/defaults' ),
  isArray: require( 'lodash/isArray' ),
  keys: require( 'lodash/keys' ),
  extend: require( 'lodash/extend' ),
  set: require( 'lodash/set' )
}

const request = require( 'superagent' );
const async = require( 'async' );
const sha1 = require( 'sha1' );
const hmacSha1 = require( 'crypto-js/hmac-sha1' );
const marked = require( 'marked' );
const toMarkdown = require( 'to-markdown' );

module.exports = options => {

  const params = _.defaults( options, {
    user: false, // required
    password: false, // required
    timeout: 6000
  } );

  if ( !params.user ) throw new Error( 'User is not set' );

  if ( !params.password ) throw new Error( 'Password is not set' );

  return translate;

  function translate( text, lang, destLang, options, cb ) {

    if ( arguments.length === 4 ) {

      cb = options;
      options = {};

    } else if ( arguments.length === 3 ) {

      cb = destLang;
      destLang = lang;
      lang = 'fr';
      options = {};

    }

    if ( _.isPlainObject( text ) ) {

      return objectTranslate( text, lang, destLang, options, cb );

    }

    if ( _.isArray( destLang ) ) {

      return multipleTextTranslate( text, lang, destLang, cb );

    }

    return singleTextTranslate( text, lang, destLang, cb );

  }


  function objectTranslate( obj, lang, destLang, options, cb ) {

    if ( arguments.length === 4 ) {

      cb = options;
      options = {};

    }

    const params = _.extend( {
      onProcess: processedLang => {},
      separator: '|||'
    }, options );

    const destLangCount = ( [].concat( destLang ) ).length;

    const translations = {}, timeoutErrors = [];

    const concatenatedObj = _.keys( obj ).map( k => obj[ k ] ).join( params.separator );
    const concatenatedTranslations = {};

    // this translates per field at first level.
    // it should translate per language

    return async.eachSeries( [].concat( destLang ), ( singleDestLang, ecb ) => {

      params.onProcess( singleDestLang );

      translate( concatenatedObj, lang, singleDestLang, ( err, concatenatedTranslation ) => {

        if ( err && err.code === 'ECONNABORTED' ) {

          timeoutErrors.push( { lang: singleDestLang } );

          return ecb();

        } else if ( err ) {

          return ecb( err );

        }

        concatenatedTranslations[ singleDestLang ] = concatenatedTranslation;

        ecb();

      } );

    }, err => {

      if ( err ) return cb( err );

      // redistribute values per field then dest lang
      _.keys( concatenatedTranslations ).forEach( singleDestLang => {

        let fieldValues = concatenatedTranslations[ singleDestLang ].split( params.separator ).map( v => v.trim() );

        _.keys( obj ).forEach( ( field, index ) => {

          _.set( translations, _.isArray( destLang ) ? field + '.' + singleDestLang : field, fieldValues[ index ] );

        } );

      } );

      cb( null, translations, timeoutErrors.length ? timeoutErrors : null );

    } );

  }

  function multipleTextTranslate( text, lang, destLang, cb ) {

    let translations = {}, timeoutErrors = [];

    return async.eachSeries( destLang, ( l, ecb ) => {

      singleTextTranslate( text, lang, l, ( err, translation ) => {

        if ( err && _isTimeoutError( err ) ) {

          timeoutErrors.push( { lang: l } );

          return ecb();

        }

        if ( err ) {

          return ecb( err );

        }

        translations[ l ] = translation;

        ecb();

      } );

    }, err => {

      if ( err ) return cb( err );

      cb( null, translations, timeoutErrors.length ? timeoutErrors : null );

    } );

  }


  function singleTextTranslate( text, lang, destLang, cb ) {

    if ( text === false || text === null || text === '' || text === undefined ) {

      return cb( null, '' );

    }

    let created = _reversoCreated(),

    signature = hmacSha1( params.user + created, params.password ),

    isUserTemplate = ( {
      fr: {
        en: 'true',
        es: 'true',
        de: 'true',
        it: 'true'
      },
      en: {
        fr: 'false',
        es: 'false',
        de: 'false',
        it: 'true'
      }
    } )[ lang ][ destLang ],

    res = [
      settings.res + '/direction=',
      _parseLang( lang ), '-', _parseLang( destLang ),
      '?template=General&isUserTemplate=',
      isUserTemplate
    ].join( '' ),

    html = '<html><body>' + marked( text ) + '</html></body>';

    request.post( res )

      .timeout( params.timeout )

      .set( 'Username', params.user )

      .set( 'Signature', signature.toString().toUpperCase() )

      .set( 'Created', created )

      .send( html )

      .end( ( err, res ) => {

        if ( err ) return cb( err );

        let html = ( Buffer.from( res.body.TranslatedHtml || '', 'base64' ) ).toString(),

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


function _isTimeoutError( err ) {

  return err.toString() === 'Error: timeout of 1ms exceeded';

}
