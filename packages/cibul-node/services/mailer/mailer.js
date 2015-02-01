"use strict";

var coms = require( '../../lib/coms' ),

i18n = require( '../../i18n/i18n' ),

router = require( '../../lib/router' ),

config = require( '../../config' ),

lib = require( '../../lib/lib' );

module.exports = {
  genUrl: genUrl,
  queueMail: queueMail
}


function queueMail( options, cb ) {

  var params = {
    recipient: false, // compulsory
    subject: false,   // compulsory. text or array
    text: false,      // compulsory. text or array
    lang: false       // optional. use translation lib if set
  };

  lib.extend( params, options );

  if ( !params.recipient || !params.subject || !params.text ) {

    return cb( 'missing mail field' );

  }

  coms.queue( 'mailer', {
    recipient: params.recipient,
    subject: _prepareText( params.subject, params.lang ),
    text: _prepareText( params.text, params.lang )
  }, cb );

}

function genUrl( uri, query ) {

  return router.makeGenUrl({
    root: config.root,
    base: { path: '' }
  })( uri, query , { abs: true, protocol: 'https' });

}

function _prepareText( text, lang ) {

  var i18nParams = typeof text == 'string' ? [ text ] : text;

  i18nParams.push( lang ? lang : 'en' );

  return i18n.apply( null, i18nParams );

}