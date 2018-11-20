"use strict";

const marked = require( 'marked' );

const renderer = new marked.Renderer();

module.exports = str => marked( str || '', { renderer } );
