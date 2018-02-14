"use strict";

const FlatTransform = require( './lib/FlatTransform' );

const { head, parseEvent } = require( './lib/markdown' );

module.exports = class MarkdownStream extends FlatTransform {

  constructor( options = {} ) {

    super( {
      options,
      head,
      parseEvent
    } );

  }

}