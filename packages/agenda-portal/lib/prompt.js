"use strict";

const promptInput = require( 'prompt-input' );
const promptConfirm = require( 'prompt-confirm' );

module.exports = {
  term: function ( message, options = {} ) {

    return new promptInput(Object.assign( options, { message } ) ).run();

  },
  confirm: function ( message, options = {} ) {

    return new promptConfirm(Object.assign( options, { message } ) ).run();

  }
}
