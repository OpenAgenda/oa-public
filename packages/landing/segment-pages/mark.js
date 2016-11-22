"use strict";

const _ = require( 'lodash' );
const pug = require( 'pug' );
const marked = require( 'marked' );
const linkValidate = require( 'validators/link' )();

const renderer = new marked.Renderer();

module.exports = text => {

  let isLink = true;

  // if is not a string, do not treat as markdown
  if ( typeof text !== 'string' ) return text;

  // if is a bare link, do not treat as markdown
  try {

    linkValidate( text );

  } catch ( e ) { isLink = false; }

  if ( isLink ) return text;

  let rendered = marked( text ).replace( /^<p>|<\/p>\n$/g, '' );

  return rendered;

}