var cn = require('../../../lib/common/common.mod.js'),

hlia = require('./handleListItemAction.js'),

params = {
  url: '/share/event/{slug}',
  attribute: 'data-ata-enabled',
  labels: {
    wrong: 'Something went wrong. Please try again later or share from the event page.',
    link: 'add to agenda'
  }
};

window.handleAddToAgenda = function(options) {

  cn.extend(params, options?options:{});

  hlia(params);

};