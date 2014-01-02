if (typeof handleMessageLinks == 'undefined') var handleMessageLinks = function(params) {

  var params = extend({
    selectors: {
      links: '.js_message_link'
    },
    events: ['contentload', 'lhSuccess', 'success', 'loadSuccess'],
    attribute: 'data-enabled'
  }, typeof params == 'undefined'?{}:params)

  , eh = sEventHandler.getInstance()

  , scan = function() {

    forEach(els(params.selectors.links), function(linkElem) {

      if (!linkElem.hasAttribute(params.attribute)) {

        action(linkElem, {type: 'ajax'});

        linkElem.setAttribute(params.attribute, true);

      }

    });
  };

  scan();

  forEach(params.events, function(eventName) {
    eh.on(eventName, scan);
  });

};