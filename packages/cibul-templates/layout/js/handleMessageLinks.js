var cn = require('../../js/lib/common'),

action = require('./action.js'),

debug = require('debug'),

log = debug('handleMessageLinks'),

params = {
  selectors: {
    links: '.js_message_link'
  },
  events: ['contentload', 'lhSuccess', 'success', 'loadSuccess'],
  attribute: 'data-enabled'
};

module.exports = function(eh, options) {

  // assuming the document is loaded

  if (typeof options !== 'undefined') cn.extend(params, options);

  cn.forEach( params.events, function( eventName ) {

    eh.on( eventName, scan );

  });

  scan();

};

var scan = function() {

  cn.forEach(cn.els(params.selectors.links), function(linkElem) {

    if (linkElem.hasAttribute(params.attribute)) return;

    cn.addEvent(linkElem, 'click', function(e) {

      cn.preventDefault(e);

      action.get(linkElem.getAttribute('href'), {loadLightbox: true, errorLightbox: true});

      linkElem.setAttribute(params.attribute, true);

    });

  });

};
