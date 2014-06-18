var cn = require('../../js/lib/common/common.mod.js'),

b64 = require('../../js/lib/Base64/Base64.mod.js'),

cookies = require('../../js/vendors/Cookies-master/src/cookies.js'),

lightbox = require('../../js/lib/lightbox/lightbox.mod.js'),

cookieValues,

params = {
  keys: {
    cookie: 'cibul',
    value: 'flash', 
    type: 'flash_type'
  },
  classes: {
    canvas: 'lightbox-canvas',
    frame: 'wsq lightbox-frame',
    buttonBox: 'lightbox-buttons'
  }
}

module.exports = function() {

  var c = read();

  if (!c.value.length) return;

  lightbox({
    message: c.value,
    classes: params.classes
  });

  clear();

};

var read = function() {

  cookieValues = JSON.parse(b64.decode(cookies(params.keys.cookie)));

  return {
    value: cookieValues[params.keys.value],
    type: cookieValues[params.keys.type]
  }

},

clear = function() {

  cookieValues[params.keys.value] = false;
  cookieValues[params.keys.type] = false;

  cookies.set(params.keys.cookie, b64.encode(JSON.stringify(cookieValues)));

}