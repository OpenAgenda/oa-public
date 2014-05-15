var cn = require('../../js/lib/common/common.mod.js'),

handleNav = require('../../js/cibul/handleNav/src/handleNav.mod.js'),

handleList =  require('../../js/cibul/handleList/src/handleList.mod.js'),

handleLock = require('../../js/cibul/handleLock/src/handleLock.mod.js'),

debug = require('debug'),

log = debug('handleListPage'),

params = {
  eh: false, // required. event handler
  url: false,
  elems: { listCanvas: false, navNext: false, navPrevious: false, lockCanvas: false },
  initNav: [false, false],
  debug: false,
  anchor: 'list',
  itemFilter: false,       // callback used on each received values of list
  mainItem: false          // takes the first template as main by default
};

module.exports = function(options) {

  params = cn.extend(params, options);
  
  handleList(params.elems.listCanvas, params.eh, {
    url: params.url,
    params: params.debug?{format: 'jsonp'}:{},
    ajax: !params.debug,
    itemFilter: params.itemFilter,
    mainItem: _getMainItem(),
    templates: params.templates,
    triggerEvents: { load: 'load', loadPrevious: 'loadPrevious', loadNext: 'loadNext' },
    triggeredEvents: { loading: 'loading', complete: 'loadComplete', success:'loadSuccess', fail: 'loadFail', lock: 'locklist', unlock: 'unlocklist' },
    anchor: params.anchor
  });

  handleNav(params.elems.navPrevious, params.elems.navNext, params.eh, {
    triggerEvents: { loading: 'loading', loadSuccess: 'loadSuccess', loadFail: 'loadFail'},
    triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious' },
    url: params.url,
    initDisplay: params.initNav,
    anchor: params.anchor,
    relyOnCount: true
  });

  handleLock(params.elems.listCanvas, params.eh, {events: {lock: 'locklist', unlock: 'unlocklist' }});

};

var _getMainItem = function() {

  if (params.mainItem) return params.mainItem;

  for (var index in params.templates)
    return index;

};