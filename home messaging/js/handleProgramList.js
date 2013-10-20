var handleProgramList = function(params) {

  params = extend({
    url: window.location.href.indexOf('#')==-1?window.location.href:window.location.href.substr(0,window.location.href.indexOf('#')),
    elems: { listCanvas: false, navNext: false, navPrevious: false, lockCanvas: false },
    initNav: [false, false],
    debug: false,
    anchor: 'myprogs'
  }, params);

  params.templates = extend({
    program: false, 
  }, params.templates?params.templates:{});

  var run = function() {

    handleList(params.elems.listCanvas, sEventHandler.getInstance(), {
      url: params.url,
      params: params.debug?{format: 'jsonp'}:{},
      ajax: !params.debug,
      mainItem: 'program',
      templates: {
        program: params.templates.program
      },
      triggerEvents: { load: 'pload', loadPrevious: 'ploadPrevious', loadNext: 'ploadNext' },
      triggeredEvents: { loading: 'plhLoading', complete: 'plhComplete', success:'plhSuccess', fail: 'plhFail', lock: 'plocklist', unlock: 'punlocklist' },
      anchor: params.anchor
    });

    handleNav(params.elems.navPrevious, params.elems.navNext, sEventHandler.getInstance(), {
      triggerEvents: { loading: 'plhLoading', loadSuccess: 'plhSuccess', loadFail: 'plhFail'},
      triggeredEvents: { getNextPage: 'ploadNext', getPreviousPage: 'ploadPrevious' },
      url: params.url,
      initDisplay: params.initNav,
      anchor: params.anchor,
      relyOnCount: true
    });

    handleLock(params.elems.listCanvas, {lock: 'plocklist', unlock: 'punlocklist' });

  };

  run();

};