var cn = require('../../js/lib/common/common.mod.js'),

lightbox = require('../../js/lib/lightbox/lightbox.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

params = {
  selectors: {
    main: 'nav',
    langMenu: '.js_language_menu',
    connectLink: '.js_connect',
    externalLink: 'js_ext_link'
  }
},

langOn = false;

cn.addEvent(window, 'load', function() {

  signin();

  connect();

});

// behavior of the signin link in the header
var signin = function() {

  var headElem = cn.el(params.selectors.main),

  langMenuElem = cn.el(headElem, params.selectors.langMenu),

  langList = cn.el(langMenuElem, 'ul');

  cn.addEvent(langMenuElem, 'click', function(e) {

    if (!langOn)
      langList.style.display = 'block';
    else
      langList.removeAttribute('style');

    langOn = !langOn;

  });

},

// show connect lightbox
connect = function() {

  var headElem = cn.el(params.selectors.main),

  connectLink = cn.el(headElem, params.selectors.connectLink);

  cn.addEvent(connectLink, 'click', function(e) {

    cn.preventDefault(e);

    remote.getXmlHttp(connectLink.getAttribute('href'), function(responseType, data) {

      // if something does not go right, load the auth page
      if (responseType!=='success' || !data.success) {
        
        window.location.href = connectLink.getAttribute('href');

        return;

      }

      lightbox({
        html: data.partial,
        buttons: false,
        classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons', button: 'small button'}
      });

    });

  });

};