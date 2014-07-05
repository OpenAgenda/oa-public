var cn = require('../../../lib/common/common.mod.js'),

hlia = require('./handleListItemAction.js'),

params = {
  url: '/publish/event/{slug}',
  attribute: 'data-ep-enabled',
  labels: {
    wrong: 'Something went wrong. Please try again later or publish from the event page.',
    link: 'publish'
  },
  ajax: false
};

window.handleEventPublish = function(options) {

  params.filter = filter;

  cn.extend(params, options?options:{});

  hlia(params);

};


var filter = function(element, slug, data) {

  if (data.url.indexOf('/preview/')!==-1) return false;

  return true;

}