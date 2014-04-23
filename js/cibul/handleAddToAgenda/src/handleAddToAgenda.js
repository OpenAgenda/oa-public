var cn = require('../../../lib/common/common.mod.js'),

remote = require('../../../lib/remote/remote.mod.js'),

inited = false;

lightbox = require('../../../lib/lightbox/lightbox.mod.js'),

lbDefautlts = {},

lbInst = false,

params = {
  url: '/share/event/{slug}',
  w: false, // required - the window object
  eh: false, // required - the event handler
  canvas: false,  // where the link should be placed in the list item
  wrapper: false, // if the link should be set in a wrapping element
  init: {selector: false, attribute: false}, // used if page is preloaded and initial sweep must be made looking at slug
  events: {
    itemReady: 'listItemReady',
    responseReceived: 'eventshareresponse',
    sessionData: 'getsessiondata'
  },
  template: '<a><%= label %></a>',
  attribute: 'data-ata-enabled',
  classes: {
    link: 'url',
    lightbox: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas',
      buttonBox: 'lightbox-buttons',
      button: 'small button'
    }
  },
  labels: {
    wrong: 'Something went wrong. Please try again later or share from the event page.',
    link: 'add to agenda'
  }
};

module.exports = function(options) {

  cn.extend(params, options?options:{});

  params.eh.trigger(params.events.sessionData, function(data) {

    if (data.logged) init();

  });

};

var init = function() {

  lbDefaults = { classes: params.classes.lightbox, buttons: false };

  params.eh.on(params.events.itemReady, function(item) {

    if (!cn.contains(['article', 'event'], item.data.template)) return;

    processListItem(item.element, item.data.values.slug);

  });

  if (params.init.selector) forEach(els(params.init.selector), function(element) {

    processListItem(element, element.getAttribute(params.init.attribute));

  });

  if (!inited) {

    params.eh.on('eventshareresponse', handleShareResponse);

  }

  inited = true;

},

processListItem = function(element, slug) {

  if (!element.hasAttribute(params.attribute))
    element.setAttribute(params.attribute, '1');
  else
    return;

  var link = createAndAppendLink(element);

  cn.addEvent(link, 'click', function(e) {

    cn.preventDefault(e);

    displayShareMenu(slug);

  });

},

createAndAppendLink = function(element) {

  var wrapper = document.createElement(params.wrapper?params.wrapper:'div');

  wrapper.innerHTML = params.template.replace('<%= label %>', params.labels.link);

  var link = cn.childObject(wrapper, 0);

  cn.addClass(link, params.classes.link);

  (params.canvas?el(element, params.canvas):element).appendChild(params.wrapper?wrapper:link);

  return link;

},

displayShareMenu = function(slug) {

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

handleShareResponse = function(data) {

  if (lbInst) lbInst.hide();

  if (!data.success) return lightbox({message: params.labels.wrong, classes: params.classes.lightbox});

  if (!data.valid) return lightbox({html: data.partial, classes: params.classes.lightbox, buttons: false});

  lightbox({message: data.message, classes: params.classes.lightbox});

};