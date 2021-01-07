var handleListPage = function(params) {

  params = extend({
    url: false,
    elems: { listCanvas: false, navNext: false, navPrevious: false, lockCanvas: false },
    initNav: [false, false],
    debug: false,
    anchor: 'list',
    itemFilter: false,       // callback used on each received values of list
    mainItem: false          // takes the first template as main by default
  }, params);
  

  var run = function() {

    handleList(params.elems.listCanvas, sEventHandler.getInstance(), {
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

    handleNav(params.elems.navPrevious, params.elems.navNext, sEventHandler.getInstance(), {
      triggerEvents: { loading: 'loading', loadSuccess: 'loadSuccess', loadFail: 'loadFail'},
      triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious' },
      url: params.url,
      initDisplay: params.initNav,
      anchor: params.anchor,
      relyOnCount: true
    });

    handleLock(params.elems.listCanvas, {lock: 'locklist', unlock: 'unlocklist' });

  },

  _getMainItem = function() {

    if (params.mainItem) return params.mainItem;

    for (var index in params.templates)
      return index;

  };

  run();

};