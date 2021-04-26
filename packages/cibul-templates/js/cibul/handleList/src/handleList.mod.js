require('../../../lib/urlStrings/urlStrings.js');

var cn = require('../../../lib/common/common.mod.js'),

remote = require('../../../lib/remote/remote.mod.js'),

hash = require('../../../lib/hash/hash.mod.js'),

_ = require('lodash'),

lockElt,
spinner,
parameters,
OVERWRITE = 0,
AFTER = 1,
BEFORE = -1,
pageRange = false,
sectionRange = false,
resource = false,
locked = false,
lockAnchor,
eventHandler,

params = {
  itemsPerPage: 10,
  url: false,
  params: {},
  anchor: false,
  ajax: true,
  ready: false,
  filter: false,
  itemFilter: false, // function passed to items as they are received
  listOffset: 150,
  triggerScroll: true,
},

triggerEvents = {
  load: 'load',
  loadPrevious: 'loadPrevious',
  loadNext: 'loadNext',
  getParams: 'getlistparams'
},

triggeredEvents = {
  loading: 'lhLoading',
  complete: 'lhComplete',
  success:'lhSuccess',
  fail: 'lhFail',
  lock: 'lock',
  unlock: 'unlock',
  itemReady: 'listItemReady'
},

debug = require('debug'),

log = debug('handleList'),

elem = false; // list canvas

module.exports = function(canvas, eh, options) {

  eventHandler = eh;

  cn.extend(params, options);

  elem = canvas;

  log('initializing handleList');

  params.triggerEvents = cn.extend(triggerEvents, options.triggerEvents?options.triggerEvents:{});

  params.triggeredEvents = cn.extend(triggeredEvents, options.triggeredEvents?options.triggeredEvents:{});

  resource = params.url.substr(0, params.url.indexOf('?')==-1?resource.length:params.url.indexOf('?'));

  parameters = params.url.getUrlParameters();

  if (parameters.page == '1') delete parameters.page;

  if (elem.innerHTML) pageRange = [parseInt(_getParameter('page',1),10), parseInt(_getParameter('page',1),10)];

  var aParameters = params.anchor?hash.getBase64Param(params.anchor,{}):{};
  if (aParameters.page == '1') delete aParameters.page;

  var initLoad = elem.innerHTML?false:true;

  if (Object.size(aParameters)) {

    if (!initLoad)
      if (Object.size(asymDiff(aParameters, parameters)) || Object.size(asymDiff(parameters, aParameters)))
        initLoad = true;

    parameters = aParameters;

  }

  if (initLoad) {

    log('initial load is required');

    _writePage(parameters);

  }

  // listen to load data event
  eventHandler.on(params.triggerEvents.load, _writePage);

  eventHandler.on(params.triggerEvents.loadNext, _writeNextPage);

  eventHandler.on(params.triggerEvents.loadPrevious, _writePreviousPage);

  if (params.triggerEvents.getParams) eventHandler.on(params.triggerEvents.getParams, function(callback) {
    callback(parameters);
  });

};

var _writePage = function(newParams) {

  if (!Object.size(newParams)) newParams = false;

  var pageSet = false;

  if (newParams) {

    if (params.filter) newParams = params.filter(newParams);

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

  log('initiating load and write at position %s', ['before', 'overwrite', 'after'][position+1]);

  eventHandler.trigger(params.triggeredEvents.loading);

  if (typeof position == 'undefined') position = OVERWRITE;

  _lockElem(position);

  remote.get(resource, { data: cn.extend({}, params.params, parameters), retries: 3, timeout: 5000 }, function(responseType, data) {

    _unlockElem();

    eventHandler.trigger(params.triggeredEvents.complete);

    // needs to handle error (responseType other than success)

    if (responseType != 'success') return eventHandler.trigger(params.triggeredEvents.fail);

    // got the data, update the page range
    _updatePageRange();

    // now shove it in templates and apply behavior

    var element;
    var receivedCount = 0;

    if (position==OVERWRITE) {
      while (cn.childObject(elem,0)) elem.removeChild(childObject(elem,0));
    }

    var processListItem = function(value) {

      if (typeof value.template == 'undefined') value.template = params.mainItem;

      if (params.itemFilter) params.itemFilter(value);

      if (value.template == params.mainItem) receivedCount++;

      element = document.createElement('div');

      element.innerHTML = _.template(params.templates[value.template])(value);
      element = element.firstChild;

      if (params.scripts && params.scripts[value.template]) params.scripts[value.template](element, value);

      if (position!==BEFORE)
        elem.appendChild(element);
      else
        elem.insertAdjacentElement('afterbegin', element);

      eventHandler.trigger(params.triggeredEvents.itemReady, {element: element, data: value});

    };

    if (position!==BEFORE)
      for (var i = 0; i < data.data.length; i++)
        processListItem(data.data[i]);
    else
      for (i = data.data.length - 1; i >= 0; i--)
        processListItem(data.data[i]);

    if ((position==OVERWRITE) && params.triggerScroll) _scrollToTop();

    if (params.anchor) hash.setBase64Param(params.anchor, parameters);

    eventHandler.trigger(params.triggeredEvents.success, cn.extend({count: receivedCount, next: data.next, prev: data.prev, reset: position==OVERWRITE?true:false }, parameters, {data: data.data}));

  }, params.ajax);

},

_lockElem = function(position) {

  if (locked) return;

  locked = true;

  eventHandler.trigger(params.triggeredEvents.lock, {position: position==AFTER?'bottom':'top'});

},

_unlockElem = function() {

  if (!locked) return;
  locked = false;

  eventHandler.trigger(params.triggeredEvents.unlock);

},

_scrollToTop = function() {

  var timer = setInterval(function(){
    if (getScrollOffsets().y < params.listOffset) clearInterval(timer);
    else window.scrollBy(0, -20);
  }, 10);

};
