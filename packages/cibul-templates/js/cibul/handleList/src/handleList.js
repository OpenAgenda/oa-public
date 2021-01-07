var handleList = function(elem, eventHandler, options) {

  var lockElt,
    spinner,
    parameters,
    templates = {},
    OVERWRITE = 0,
    AFTER = 1,
    BEFORE = -1,
    pageRange = false,
    sectionRange = false,
    resource = false,
    locked = false,
    lockAnchor,

  options = extend({
    itemsPerPage: 10,
    url: false,
    params: {},
    anchor: false,
    ajax: true,
    ready: false,
    filter: false,
    itemFilter: false, // function passed to items as they are received
    listOffset: 150,
    triggerScroll: true
  }, options);

  options.triggerEvents = extend({
    load: 'load',
    loadPrevious: 'loadPrevious',
    loadNext: 'loadNext',
    getParams: 'getlistparams'
  }, options.triggerEvents?options.triggerEvents:{});

  options.triggeredEvents = extend({
    loading: 'lhLoading',
    complete: 'lhComplete',
    success:'lhSuccess',
    fail: 'lhFail',
    lock: 'lock',
    unlock: 'unlock',
    itemReady: 'listItemReady'
  }, options.triggeredEvents?options.triggeredEvents:{});


  var init = function(){

    resource = options.url.substr(0, options.url.indexOf('?')==-1?resource.length:options.url.indexOf('?'));

    parameters = options.url.getUrlParameters();

    if ( parameters.page == '1' ) delete parameters.page;

    if ( elem.innerHTML ) pageRange = [parseInt(_getParameter('page',1),10), parseInt(_getParameter('page',1),10)];

    // load all templates and behavior functions
    for ( var index in options.templates ) {

      templates[index] = new EJS({ text: options.templates[index] });

    }

    var aParameters = options.anchor?hash.getBase64Param(options.anchor,{}):{};
    if (aParameters.page == '1') delete aParameters.page;

    var initLoad = elem.innerHTML?false:true;

    if (Object.size(aParameters)) {

      if (!initLoad) {
        if (Object.size(asymDiff(aParameters, parameters)) || Object.size(asymDiff(parameters, aParameters))) initLoad = true;
      }
        
      parameters = aParameters;

    }

    if (initLoad) _writePage(parameters);

    // listen to load data event
    eventHandler.on(options.triggerEvents.load, _writePage);

    eventHandler.on(options.triggerEvents.loadNext, _writeNextPage);

    eventHandler.on(options.triggerEvents.loadPrevious, _writePreviousPage);

    if (options.triggerEvents.getParams) eventHandler.on(options.triggerEvents.getParams, function(callback) {
      callback(parameters);
    });

  },

  _writePage = function(newParams) {

    if (!Object.size(newParams)) newParams = false;

    var pageSet = false;

    if (newParams) {

      if (options.filter) newParams = options.filter(newParams);

      for (var index in newParams) {

        if (index=='page') pageSet = true;

        if (newParams[index] === null) {
          _removeParameter(index);
        } else {
          _setParameter(index, newParams[index]);
        }
        
      }

    }

    if (!pageSet) _setParameter('page', 1);

    pageRange = false;
    
    _loadAndWriteContent(OVERWRITE);

  },

  _writeNextPage = function() {

    _setParameter('page', pageRange?pageRange[1] + 1:parseInt(_getParameter('page',1),10));

    _loadAndWriteContent(AFTER);

  },

  _writePreviousPage = function() {

    _setParameter('page', pageRange?pageRange[0] - 1:parseInt(_getParameter('page',1),10));

    _loadAndWriteContent(BEFORE);

  },

  _getParameter = function(name, defaultValue) {

    if (typeof parameters[name] == 'undefined') _setParameter(name, defaultValue);

    return parameters[name];

  },

  _setParameter = function(name, value) {

    parameters[name] = value;

  },

  _updatePageRange = function() {

    var page = parseInt(_getParameter('page',1), 10);
    
    if (pageRange) {
      pageRange = [Math.min(pageRange[0], page), Math.max(pageRange[1], page)];
    } else {
      pageRange = [page,page];
    }
  },

  _removeParameter = function(name) {

    if (typeof parameters[name] != 'undefined') delete parameters[name];

  },

  _loadAndWriteContent = function(position){

    eventHandler.trigger(options.triggeredEvents.loading);

    if (typeof position == 'undefined') position = OVERWRITE;

    _lockElem(position);

    remote.get(resource, { data: extend({}, options.params, parameters), retries: 3, timeout: 5000 }, function(responseType, data) {

      _unlockElem();

      eventHandler.trigger(options.triggeredEvents.complete);

      // needs to handle error (responseType other than success)

      if (responseType != 'success') return eventHandler.trigger(options.triggeredEvents.fail);

      // got the data, update the page range
      _updatePageRange();

      // now shove it in templates and apply behavior

      var element;
      var receivedCount = 0;

      if (position==OVERWRITE) {
        while (childObject(elem,0)) elem.removeChild(childObject(elem,0));
      }

      var processListItem = function(value) {

        if (typeof value.template == 'undefined') value.template = options.mainItem;

        if (options.itemFilter) options.itemFilter(value);

        if (value.template == options.mainItem) receivedCount++;

        element = document.createElement('div');
        element.innerHTML = templates[value.template].render(value);
        element = element.firstChild;

        if (options.scripts && options.scripts[value.template]) options.scripts[value.template](element, value);

        if (position!==BEFORE)
          elem.appendChild(element);
        else
          elem.insertAdjacentElement('afterbegin', element);

        eventHandler.trigger(options.triggeredEvents.itemReady, {element: element, data: value});

      };


      if (position!==BEFORE)
        for (var i = 0; i < data.data.length; i++)
          processListItem(data.data[i]);
      else
        for (var i = data.data.length - 1; i >= 0; i--)
          processListItem(data.data[i]);

      if ((position==OVERWRITE) && options.triggerScroll) _scrollToTop();

      if (options.anchor) hash.setBase64Param(options.anchor, parameters);

      eventHandler.trigger(options.triggeredEvents.success, extend({count: receivedCount, next: data.next, prev: data.prev, reset: position==OVERWRITE?true:false }, parameters, {data: data.data}));

    }, options.ajax);

  },
  _lockElem = function(position) {

    if (locked) return;

    locked = true;

    eventHandler.trigger(options.triggeredEvents.lock, {position: position==AFTER?'bottom':'top'});

  },
  _unlockElem = function() {

    if (!locked) return;
    locked = false;

    eventHandler.trigger(options.triggeredEvents.unlock);

  },
  _scrollToTop = function() {

    var timer = setInterval(function(){
      if (getScrollOffsets().y < options.listOffset) clearInterval(timer);
      else window.scrollBy(0, -20);
    }, 10);

  };

  init();

};


var programParamFilter = function(params) {
  
  var setFilter = false;
  var resetParams = {
    category: null,
    tag: null,
    from: null,
    to: null,
    location: null
  };

  for (var name in params) {

    if (contains(['from', 'to'], name)) {

      params = extend(resetParams, {from: params.from, to: params.to});
      break;

    } else if (contains(['category', 'tag', 'location'], name)) {

      resetParams[name] = params[name];

      params = resetParams;
      break;

    }

  }

  return params;
};