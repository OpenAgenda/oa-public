var handleEventList = function(params) {

  params = extend({
    url: window.location.href.indexOf('#')==-1?window.location.href:window.location.href.substr(0,window.location.href.indexOf('#')),
    elems: { listCanvas: false, navNext: false, navPrevious: false, lockCanvas: false },
    initNav: [false, false],
    debug: false,
    anchor: 'search',
    orders: {
      relevance: { label: 'pertinence' },
      place: { label: 'lieu' },
      date: { label: 'date' }
    },
    defaultOrder: 'relevance',
    includeFilters: false
  }, params);

  params.labels = extend({
    order: 'order',
    includePast: 'include past events',
    excludePast: 'exclude past events',
    filters: 'filters',
    titleFilter: 'title',
    locationFilter: 'place name'
  }, params.labels?params.labels:{});

  params.templates = extend({
    event: false,
    order: '<li class="mlis"><h2><%= values.order %></h2></li>',
    pastLink: '<div class="past-link"><a><i class="fa fa-clock-o"></i><span><%= includePast %></span></a><a><i class="fa fa-remove"></i><span><%= excludePast %></span></a>',
    orderSelect: '<div class="js_select order"><i class="fa fa-sort-amount-desc"></i><span><%= label %>: <span class="js_chosen"></span></div><ul class="order-list js_menu wsq"><% for (index in orders) { %><li data-order="<%= index %>"><%= orders[index].label %></li><% } %></ul>'
  }, params.templates?params.templates:{});


  handleList(params.elems.listCanvas, sEventHandler.getInstance(), {
    url: params.url,
    params: params.debug?{format: 'jsonp'}:{},
    ajax: !params.debug,
    mainItem: 'event',
    templates: {
      event: params.templates.event,
      order: params.templates.order
    },
    scripts: { event: function(){} },
    triggerEvents: { load: 'load', loadPrevious: 'loadPrevious', loadNext: 'loadNext' },
    triggeredEvents: { loading: 'lhLoading', complete: 'lhComplete', success:'lhSuccess', fail: 'lhFail', lock: 'locklist', unlock: 'unlocklist' },
    anchor: params.anchor
  });

  handleNav(params.elems.navPrevious, params.elems.navNext, sEventHandler.getInstance(), {
    triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail'},
    triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious' },
    url: params.url,
    initDisplay: params.initNav,
    anchor: params.anchor,
    relyOnCount: true
  });

  handleLock(params.elems.listCanvas, {lock: 'locklist', unlock: 'unlocklist' });

  if (params.includeFilters) handleEventListFilters({
    canvas: params.elems.listHead,
    labels: params.labels
  });

};