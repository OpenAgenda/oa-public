var cn = require('../../../lib/common/common.mod.js'),

remote = require('../../../lib/remote/remote.mod.js'),

inited = false;

lightbox = require('../../../lib/lightbox/lightbox.mod.js'),

b64 = require('../../../lib/Base64/Base64.mod.js'),

lbDefautlts = {},

lbInst = false,

defaults = {
  url: false, // required
  w: false, // required - the window object
  eh: false, // required - the event handler
  canvas: false,  // where the link should be placed in the list item
  wrapper: false, // if the link should be set in a wrapping element
  init: {selector: false, attribute: false}, // used if page is preloaded and initial sweep must be made looking at slug
  events: {
    itemReady: 'listItemReady',
    sessionData: 'getsessiondata'
  },
  template: '<a><%= label %></a>',
  attribute: false,  // required
  classes: {
    link: 'url',
    lightbox: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas',
      buttonBox: 'lightbox-buttons',
      button: 'small button'
    }
  },
  ajax: true,
  labels: false, // required
};

module.exports = function(options) {

  var params = cn.extend({}, defaults, options?options:{});

  params.eh.trigger(params.events.sessionData, function(data) {

    if (data.logged) init(params);

  });

};


var init = function(params) {

  lbDefaults = { classes: params.classes.lightbox, buttons: false };

  params.eh.on(params.events.itemReady, function(item) {

    if (!cn.contains(['article', 'event'], item.data.template)) return;

    processListItem(params, item.element, item.data.slug, item.data);

  });

  if (params.init.selector) forEach(els(params.init.selector), function(element) {

    processListItem(params, element, element.getAttribute(params.init.attribute));

  });


  params.eh.on('eventshareresponse', handleLightboxResponse(params));

  inited = true;

},


/**
 * append action item to event list item
 */

processListItem = function(params, element, slug, data) {

  if (!element.hasAttribute(params.attribute))
    element.setAttribute(params.attribute, '1');
  else
    return;

  if (params.filter && params.filter(element, slug, data)) return;

  var link = createAndAppendLink(params, element);

  cn.addEvent(link, 'click', function(e) {

    cn.preventDefault(e);

    runAction(params, slug);

  });

},


createAndAppendLink = function(params, element) {

  var wrapper = document.createElement(params.wrapper?params.wrapper:'div');

  wrapper.innerHTML = params.template.replace('<%= label %>', params.labels.link);

  var link = cn.childObject(wrapper, 0);

  cn.addClass(link, params.classes.link);

  (params.canvas?el(element, params.canvas):element).appendChild(params.wrapper?wrapper:link);

  return link;

},

runAction = function(params, slug) {

  if (!params.ajax) {

    window.location.href = params.url.replace('slug', slug) + '?redirect=' + b64.encode(window.location.href);

    return;

  }


  remote.getXmlHttp(params.url.replace('slug', slug), {data: {ajax_post: '1'}}, function(responseType, data) {

    var lbParams = cn.extend({}, lbDefaults);

    if (data.success === false) {

      cn.extend(lbParams, { message: data.message, buttons: true });

    } else {

      cn.extend(lbParams, { html: data.partial });

    }

    lbInst = lightbox(lbParams);

  });

},

handleLightboxResponse = function(params) {

  return function(data) {

    if (lbInst) lbInst.hide();

    if (!data.success) return lightbox({message: params.labels.wrong, classes: params.classes.lightbox});

    if (!data.valid) return lightbox({html: data.partial, classes: params.classes.lightbox, buttons: false});

    lightbox({message: data.message, classes: params.classes.lightbox});

  };

};