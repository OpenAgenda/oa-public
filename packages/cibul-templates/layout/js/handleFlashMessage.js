"use strict";

import session from '@openagenda/sessions/client';

const lightbox = require('../../js/lib/lightbox'),

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
