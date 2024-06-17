"use strict";

const _ = require( 'lodash' );
const pug = require( 'pug' );
const { fromMarkdownToHTML } = require('@openagenda/md');
const linkValidate = require( '@openagenda/validators/link' )();
const emailValidate = require( '@openagenda/validators/email' )();

module.exports = text => {

  let markIt = true;

  // if is not a string, do not treat as markdown
  if ( typeof text !== 'string' ) return text;

  // if is a bare link, do not treat as markdown
  try {

    linkValidate( text );

    markIt = false;

  } catch ( e ) {  }

  // if is a bare email, do not treat as markdown
  try {

    emailValidate( text );

    markIt = false;

  } catch ( e ) { }

  if ( !markIt ) return text;

  let rendered = fromMarkdownToHTML( text ).replace( /^<p>|<\/p>\n$/g, '' );

  return rendered;

}