var cn = require('../../../lib/common/common.mod.js'),

hash = require('../../../lib/hash/hash.mod.js'),

params = {
  displayNoneClass: 'display-none',
  triggerEvents: { loading: 'loading', loadSuccess: 'success', loadFail: 'fail' },
  triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious', hasNextPage: false },
  itemToCount: 'article',
  itemsPerPage: 10,
  disabledClass: 'disabled',
  scrollElt: false,
  initDisplay: [false,false],
  relyOnCount: false,
  url: false
},

enabled = [false, false],

pageRange = [],

PREVIOUS = 0, NEXT = 1, FIRST = 0, LAST = 1,

previousPageElement, nextPageElement, eventHandler;

module.exports = function(previousElt, nextElt, eh, options) {

  previousPageElement = previousElt;

  nextPageElement = nextElt;

  eventHandler = eh;

  params.scrollElt = cn.el('body');

  extend(params, options);

  if (params.initDisplay[PREVIOUS]!==false) _toggle(PREVIOUS, true);
  if (params.initDisplay[NEXT]!==false) {
    _toggle(NEXT, true);
    if (params.triggeredEvents.hasNextPage) eventHandler.trigger(params.triggeredEvents.hasNextPage, true);
  }

  _initPageRange();

  eventHandler.on(params.triggerEvents.loading, function(){

    _disable(PREVIOUS);

    _disable(NEXT);
    
  });

  eventHandler.on(params.triggerEvents.loadFail, function(){
    _enable(PREVIOUS);
    _enable(NEXT);
  });

  // enable/disable nav buttons on reception of data
  eventHandler.on(params.triggerEvents.loadSuccess, function(eventData) {

    var newSet = true;

    if (pageRange.length) if (eventData.page > pageRange[LAST] || eventData.page < pageRange[FIRST]) newSet = false;

    var hasNext = eventData.next!==false && ( (eventData.count == params.itemsPerPage) || params.relyOnCount);

    if (params.triggeredEvents.hasNextPage) eventHandler.trigger(params.triggeredEvents.hasNextPage, hasNext);

    if (newSet) {
      // is inside range. init on both sides

      _toggle(PREVIOUS, eventData.prev!==false);

      _toggle(NEXT, hasNext);

      pageRange = [eventData.page, eventData.page];

    } else {
      // is outside range

      if (eventData.page > pageRange[LAST]) {

        _toggle(NEXT, hasNext);

        if (previousPageElement) if (!hasClass(previousPageElement, params.displayNoneClass)) _enable(PREVIOUS);

      } else {

        _toggle(PREVIOUS, eventData.prev!==false);

        if (!cn.hasClass(nextPageElement, params.displayNoneClass)) _enable(NEXT);

      }

      pageRange = [Math.min(eventData.page, pageRange[FIRST]), Math.max(eventData.page, pageRange[LAST])];
    }

  });

  if (previousPageElement) cn.addEvent(previousPageElement, 'click', function(e){

    preventDefault(e);

    if (enabled[0]) {
      eventHandler.trigger(params.triggeredEvents.getPreviousPage);
    }

  });

  cn.addEvent(nextPageElement, 'click', function(e){

    cn.preventDefault(e);

    _getNextPage();

  });

  cn.addEvent(document, 'scroll', function(){
    if (_scrollEndTrigger()) _getNextPage();
  });
  
};

var _getNextPage = function(){

  if (enabled[NEXT])
    eventHandler.trigger(params.triggeredEvents.getNextPage);

},

_reset = function() {

  pageRange = [];

},

_enable = function(navButtonIndex) {

  cn.removeClass(navButtonIndex?nextPageElement:previousPageElement, params.disabledClass);
  enabled[navButtonIndex] = true;

},

_disable = function(navButtonIndex) {

  cn.addClass(navButtonIndex?nextPageElement:previousPageElement, params.disabledClass);
  enabled[navButtonIndex] = false;

},

_toggle = function(navButtonIndex, activate) {

  if (activate) {

    cn.removeClass(navButtonIndex?nextPageElement:previousPageElement, params.displayNoneClass);
    _enable(navButtonIndex);

  } else {

    cn.addClass(navButtonIndex?nextPageElement:previousPageElement, params.displayNoneClass);
    _disable(navButtonIndex);

  }

},

_scrollEndTrigger = function() {

  if (enabled[NEXT]) {
    if (params.scrollElt.parentNode.clientHeight+params.scrollElt.scrollTop >= params.scrollElt.scrollHeight) {
      return true;
    }
  }

  return false;
},

_initPageRange = function() {

  var initParams = extend(params.url.getUrlParameters(), params.anchor?hash.getBase64Param(params.anchor,{}):{});
  
  var initPage = typeof initParams != 'undefined'?initParams.page:1;

  pageRange = [initPage, initPage];

};