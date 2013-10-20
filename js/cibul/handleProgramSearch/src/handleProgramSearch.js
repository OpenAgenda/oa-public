var handleProgramSearch = function(params) {

  params = extend({
    url: false, // required. main search resource
    elems: { 
      listCanvas: false, // where list items are piled up
      navNext: false,
      lockCanvas: false
    },
    debug: false,
    templates: {
      program: false // required. template of a program list item
    },
    events: {
      lock: 'searchLock',
      unlock: 'searchUnlock'
    }
  }, params);

  var eh = sEventHandler.getInstance(),

  init = function() {

    new Flowinate(params.elems.listCanvas);

    _handleList();

    _initPageNav();

    handleLock(params.elems.lockCanvas, {lock: params.events.lock, unlock: params.events.unlock });

  },

  _handleList = function() {

    handleList(params.elems.listCanvas, eh, {
      url: params.url,
      anchor: false,
      params: params.debug?{format: 'jsonp'}:{},
      ajax: params.debug?false:true,
      mainItem: 'programItem',
      templates: {
        programItem: params.templates.programItem,
      },
      scripts: {
        programItem: function(){}
      },
      triggerEvents: { load: 'load', loadPrevious: 'loadPrevious', loadNext: 'loadNext' },
      triggeredEvents: { loading: 'lhLoading', complete: 'lhComplete', success:'lhSuccess', fail: 'lhFail', lock: params.events.lock, unlock: params.events.unlock },
      filter: programParamFilter, // filter out filter parameters
    });

  },

  _initPageNav = function(){

    handleNav(false, params.elems.navNext, eh, {
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail'},
      triggeredEvents: { getNextPage: 'loadNext' },
      url: params.url,
      initDisplay: [false, params.initNext]
    });

  };

  init();

};