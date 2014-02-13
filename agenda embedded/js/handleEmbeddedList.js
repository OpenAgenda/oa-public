var handleEmbeddedList = function(options) {

  options = extend({
    url: false,           // required. resource where to get the list item data
    eventUrl: false,      // required. resource to get embedded event
    culture: 'en',
    cultureLabels: {
      fr: 'français',
      en: 'english',
      it: 'italiano'
    },
    oembedUrl: false,     // required. path to script for oembed
    iconRoot: 'images/',  // where are the map icons?
    control: false,       // required. either resource or data
    elems: {
      program: false,     // canvas of agenda
      event: false,       // canvas of event
      list: false,        // canvas of list
      navPrevious: false, // control for loading previous list items
      navNext: false,
      articleItems: false // initial articles
    },
    classes: {
      sections: 'plis'
    },
    events: {
      load: 'load',                          // request to load list
      loading: 'lhLoading',                  // event triggered when a list load is launched
      loadSuccess: 'success',                // event triggered when a list load has successfully completed
      loadComplete: 'lhComplete',            // event triggered when a list load is complete
      loadFail: 'lhFail',                    // event triggered when a list load has failed
      nextPageRequest: 'loadNext',           // event triggering a load of the next page
      prevPageRequest: 'loadPrev',           // event triggering a load of the previous page
      hasNextPage: 'hasNext',                // event triggered to signal that there are no next pages to load
      openEvent: 'openevent',                // request to open event triggered
      closeEvent: 'closeevent',
      heightChange: 'embedheightchange',
      openEventSuccess: 'eventopensuccess',
      lock: 'lock',
      unlock: 'unlock',
      initList: 'initlist'
    },
    templates: {
      article: false,                // ejs template for an article item
      section: false,                // ejs template for a section item
      back: false,                   // template for back button on event page
      date: false,
      month: false
    },
    init: {
      prevPage: 0,                   // previous page at initialisation
      nextPage: 2                    // next page at initialisation
    },
    labels: {
      placeInfo: 'Showing %d places. Click on a marker for details.',
      reservation: 'book'
    },
    tiles: false,
    debug: false
  }, options);

  var eh = sEventHandler.getInstance(),
    tunnel,
    eventDisplayPending = false,
    displayedEvent = false,

  _init = function() {

    // open tunnel and initialize list

    eh.on(options.events.initList, function(){

      // all this shit can just be executed on a ready event

      _handlePageNav();

      _handleList();

      _handleRemoveRepeatingSections(options.events.loadSuccess);

    });

    // parse control data and initialize head filter

    handleProgramControlData([extractLocation], function(controlData, processedData) {

      _handleHeadFilter(processedData[0], controlData.ct, controlData.t);

    }, options.control);


    // handle event open
    eh.on(options.events.openEvent, _handleEventOpen);

    eh.on(options.events.loadSuccess, function() {
      if (!displayedEvent) return;

      eh.trigger(options.events.closeEvent);

      displayedEvent.close();
      displayedEvent = false;
      
    });

    if (options.elems.articleItems.length) _applyEventListItemsBehavior();


    handleLock(options.elems.program, {lock: options.events.lock, unlock: options.events.unlock }, { fullLock: true });


    if (options.debug) _debugBehavior();

  },

  // previous and next navigation controls behavior
  _handlePageNav = function() {

    handleNav(options.elems.navPrevious, options.elems.navNext, eh, {
      triggerEvents: { loading: options.events.loading, loadSuccess: options.events.loadSuccess, loadFail: options.events.loadFail},
      triggeredEvents: { getNextPage: options.events.nextPageRequest, getPreviousPage: options.events.prevPageRequest, hasNextPage: options.events.hasNextPage },
      url: options.url,
      initDisplay: [options.init.prevPage, options.init.nextPage],
    });

  },

  _handleList = function() {

    handleList(options.elems.list, eh, {
      url: options.url,
      params: options.debug?{ format: 'jsonp' }:{},
      ajax: options.debug?false:true,
      mainItem: 'article',
      templates: {
        article: options.templates.article,
        section: options.templates.section
      },
      scripts: {
        article: _applyEventListItemBehavior,
        section: function(){}
      },
      triggerEvents: { load: options.events.load, loadPrevious: options.events.prevPageRequest, loadNext: options.events.nextPageRequest },
      triggeredEvents: { loading: options.events.loading, complete: options.events.loadComplete, success: options.events.loadSuccess, fail: options.events.loadFail, lock: options.events.lock, unlock: options.events.unlock }
    });

  },

  _applyEventListItemBehavior = function(listItemElem) {

    forEach(listItemElem.getElementsByTagName('a'), function(linkElem) {

      addEvent(linkElem, 'click', function(e) {

        preventDefault(e);

        eh.trigger(options.events.openEvent, listItemElem.getAttribute('data-euid'), {
          elems: { program: options.elems.program, event: options.elems.event }
        });

      });

    });

    forEach(listItemElem.getElementsByTagName('img'), function(imgElem) {

      addEvent(imgElem, 'load', function(e) {

        eh.trigger(options.events.heightChange);

      });

    });

  },

  _applyEventListItemsBehavior = function() {

    forEach(options.elems.articleItems, _applyEventListItemBehavior);

  },

  _handleRemoveRepeatingSections = function(triggerEvent) {

    repeatingSectionsRemove(options.elems.list, options.classes.sections, eh, triggerEvent);

  },

  _handleHeadFilter = function(locations, categories, tags) { // locations needed because of the place names

    addHeadFilterBehavior({
      canvas: el('.js_head_filter'),
      triggerEvents: { loading: options.events.loading, loadSuccess: options.events.loadSuccess, loadFail: options.events.loadFail },
      triggeredEvents: { filterClear: options.events.load },
      locations: locations,
      categories: categories,
      tags: tags,
      labels: options.labels
    });

  },

  _handleEventOpen = function(eventId) {

    eh.trigger(options.events.lock);

    displayedEvent = handleEventDisplay(eventId, {
      elems: { program: options.elems.program, event: options.elems.event },
      onHeightChange: function() {
        eh.trigger(options.events.heightChange);
      },
      onEventOpen: function() {
        eh.trigger(options.events.unlock);
        eh.trigger(options.events.openEventSuccess, {uid: eventId});
      },
      onEventClose: function() {
        eh.trigger(options.events.closeEvent);
      },
      url: options.eventUrl,
      culture: options.culture,
      cultureLabels: options.cultureLabels,
      iconRoot: options.iconRoot,
      oembedUrl: options.oembedUrl,
      templates: {
        back: options.templates.back,
        month: options.templates.month,
        date: options.templates.date
      },
      labels: options.labels,
      tiles: options.tiles
    });

  },

  _debugBehavior = function() {

    if (!options.debug) return;

    // simulate tiled templates and presentation (add a class and change thumbnails with full size images)

    if (options.debug.tiled) {
      
      options.templates.article.replace('evtb', '');

      addClass(options.elems.list.parentNode.parentNode, 'tiled');

      if (options.elems.list.querySelectorAll) forEach(options.elems.list.querySelectorAll('img'), function(imgElem) {
        imgElem.src = imgElem.src.replace('evtb', '');
      });

    };

  };

  _init();

};


