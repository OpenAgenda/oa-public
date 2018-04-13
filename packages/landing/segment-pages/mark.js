"use strict";

const _ = require( 'lodash' );
const pug = require( 'pug' );
const marked = require( 'marked' );
const linkValidate = require( '@openagenda/validators/link' )();
const emailValidate = require( '@openagenda/validators/email' )();

const renderer = new marked.Renderer();

module.exports = text => {

  let markIt = true;

  // if is not a string, do not treat as markdown
  if ( typeof text !== 'string' ) return text;

  // if is a bare link, do not treat as markdown
  try {

    linkValidate( text );

  } catch ( e ) { markIt = false; }

  // if is a bare email, do not treat as markdown
  try {

    emailValidate( text );

  } catch ( e ) { markIt = false; }

  if ( !markIt ) return text;

  let rendered = marked( text ).replace( /^<p>|<\/p>\n$/g, '' );

  return rendered;

}