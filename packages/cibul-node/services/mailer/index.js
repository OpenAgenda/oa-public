"use strict";

var coms = require( '../../lib/coms' ),

i18n = require( '../../i18n/i18n' ),

router = require( '../../lib/router' ),

config = require( '../../config' ),

utils = require( '../../lib/utils' ),

validator = require( 'validator' );

module.exports = {
  genUrl: genUrl,
  queueMail: queueMail,
  extractEmails: extractEmails,
  isEmail: validator.isEmail
}


function queueMail( options, cb ) {

  var params = {
    recipient: false, // compulsory
    subject: false,   // compulsory. text or array
    text: false,      // compulsory. text or array
    html: false,      // optional.
    lang: false       // optional. use translation lib if set
  };

  utils.extend( params, options );

  if ( !params.recipient || !params.subject || !params.text ) {

    return cb( 'missing mail field' );

  }

  coms.queue( 'mailer', {
    recipient: params.recipient,
    subject: _prepareText( params.subject, params.lang ),
    text: _prepareText( params.text, params.lang ),
    html: params.html
  }, cb );

}

function genUrl( uri, query ) {

  return router.makeGenUrl({
    root: config.root,
    base: { path: '' }
  })( uri, query , { abs: true, protocol: 'https' });

}

function extractEmails( emails ) {

  if ( typeof emails !== 'string' ) throw 'arg must be a string containing emails';

  return emails.split( /[\s;,\n\r]+/ ).filter( validator.isEmail );

}


function _prepareText( text, lang ) {

  var i18nParams = typeof text == 'string' ? [ text ] : text;

  i18nParams.push( lang ? lang : 'en' );

  return i18n.apply( null, i18nParams );

}