"use strict";

const lightbox = require('../../js/lib/lightbox/lightbox.mod.js'),

session = require( '@openagenda/sessions/client' ),

params = {
  classes: {
    canvas: 'lightbox-canvas',
    frame: 'wsq lightbox-frame text-center-important',
    buttonBox: 'lightbox-buttons',
    button: 'btn btn-primary',
    body: 'noscroll'
  }
};

module.exports = function() {

  let message = session.flash();

  if ( !message ) return;

  lightbox( {
    message,
    classes: params.classes
  } );

};