"use strict";

const Cookies = require('js-cookie');
const lightbox = require('../../js/lib/lightbox');

const params = {
  classes: {
    canvas: 'lightbox-canvas',
    frame: 'wsq lightbox-frame text-center-important',
    buttonBox: 'lightbox-buttons',
    button: 'btn btn-primary',
    body: 'noscroll'
  }
};

function readFlash() {
  const value = Cookies.get('oa.flash');
  if (!value) return null;
  Cookies.remove('oa.flash', { path: '/' });
  return value;
}

module.exports = function() {

  let message = readFlash();

  if ( !message ) return;

  lightbox( {
    message,
    classes: params.classes
  } );

};
