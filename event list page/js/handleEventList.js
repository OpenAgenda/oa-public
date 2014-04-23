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
    pastLink: '<div class="past-link"><a><i class="icon-time"></i><span><%= includePast %></span></a><a><i class="icon-remove"></i><span><%= excludePast %></span></a>',
    orderSelect: '<div class="js_select order"><i class="icon-sort-by-attributes"></i><span><%= label %>: <span class="js_chosen"></span></div><ul class="order-list js_menu wsq"><% for (index in orders) { %><li data-order="<%= index %>"><%= orders[index].label %></li><% } %></ul>'
  }, params.templates?params.templates:{});

  var run = function() {

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


    _initOrderWidget();

    _initPastLink();

  },

  _initPastLink = function() {

    //states: 0 is exluded, include - 1: is included, exclude

    var urlParams = params.url.getUrlParameters(),

    state = urlParams.passed?1:0,

    _show = function(index) {

      var links = widget.getElementsByTagName('a');

      links[0].style.display = links[1].style.display = 'none';

      links[index].style.display = 'block';

    };

    var widget = document.createElement('span');
    widget.innerHTML = new EJS({ text: params.templates.pastLink }).render(params.labels);

    addEvent(widget, 'click', function() {

      sEventHandler.getInstance().trigger('load', { passed: state?0:1 });

    });

    sEventHandler.getInstance().on('lhSuccess', function(data) {

      _show(state = data.passed?1:0);

    });

    _show(state);

    params.elems.listCanvas.insertAdjacentElement('beforebegin', widget);

  },

  _initOrderWidget = function() {

    var _pick = function(choice) {

      getElementsByClassName(widget, 'js_chosen')[0].innerHTML = params.orders[choice].label;

      forEach(getElementsByClassName(widget, 'js_menu')[0].getElementsByTagName('li'), function(li) {
        if (li.getAttribute('data-order') == choice)
          addClass(li, 'active');
        else
          removeClass(li, 'active');
      });

    };

    // create element

    var widget = document.createElement('span');
    widget.innerHTML = new EJS({ text: params.templates.orderSelect }).render({ orders: params.orders, label: params.labels.order });

    // give it behavior

    handleContextMenu(getElementsByClassName(widget, 'js_select')[0], getElementsByClassName(widget, 'js_menu')[0], sEventHandler.getInstance());

    forEach(widget.getElementsByTagName('li'), function(li) {
      addEvent(li, 'click', function(e) {
        _pick(li.getAttribute('data-order'));
        sEventHandler.getInstance().trigger('load', {order: li.getAttribute('data-order')});
      });
    });

    sEventHandler.getInstance().on('lhSuccess', function(data) {
      if (data.order) _pick(data.order);
    });

    // initialize it

    var urlParams = params.url.getUrlParameters(),
      defaultOrder = urlParams.order?urlParams.order:params.defaultOrder;

    _pick(defaultOrder);

    // prepend it above of list

    params.elems.listCanvas.insertAdjacentElement('beforebegin', widget);

  };

  run();

};