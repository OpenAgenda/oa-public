var runProgramBehavior = function(params) {

  var eh = sEventHandler.getInstance(),
  
  mobile = false;

  var init = function() {

    params = extend({
      url: false,
      currentUrl: false, // may include filtering variations
      debug: false,
      control: false, // required
      resources: { edit: '#edit', tagAdd: false, tagRemove: false, empty: false },
      lang: 'en',
      iconRoot: 'images/',
      labels: { tags: 'Tags', aggLink: 'use as sources', currentTags: 'Current Tags', programTags: 'Program Tags', addTag: 'Add a Tag', add: 'Add', more: 'more...' }, // required
      links: { follow: false, unfollow: false, addEvent: false },
      lightboxClasses: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons', button: 'small button'},
      callbacks: {},
      fbAppId: 'xxx'
    }, params);

    params.templates = extend({
      article: false,
      section: '<li class="plis"><h2><%= value %></h2></li>',
      programItem: false,
      aggItem: '<span><%= programItem %><span class="js_is_not"><i class="icon-plus"></i></span><span class="js_is"><i class="icon-ok"></i><i class="icon-remove"></i></span></span>',
      aggLink: '<a><i class="icon-share-alt"></i><span><%= label %></span></a>',
      actionsButton: '<a class="button small"><%= label %></a>'
    }, params.templates?params.templates:{});

    params.elems = extend({
      list: el('.list-items'),
      map: el('.js_map_canvas'),
      search: el('.js_map_search'),
      locationsList: el('.js_location_list'),
      shareLinks: els('.js_social_share'),
      widgetLink: el('.js_widget_link'),
      actions: el('.js_program_actions'),
      mainActions: el('.js_main_actions'),
      edit: el('.js_edit'),
      tags: el('.js_tag_widget'),
      tabCanvas: el('.js_nav_widgets'),
      shareCanvas: el('.js_share_menu')
    }, params.elems?params.elems:{});

    params.events = extend({ lock: 'lock', unlock: 'unlock', mobileCheck: 'mobilecheck' }, params.events?params.events:{});

    _initSocialShares();

    _initWidgetLink();

    getControlData(forEachLocationOfEachArticle, [extractLocation, extractDate, extractCurrentEditors], function(controlData, processedData) {

      // merge actual editors with active ones
      forEach(controlData.e, function(editor) {
        if (typeof processedData[2][editor] == 'undefined') processedData[2][editor] = 0;
      });

      handleEmptyProgram({
        canvasElem: params.elems.list,
        control: controlData,
        res: params.resources.empty,
        debug: params.debug,
        user: getCurrentUsername()
      });

      initEdition(controlData.m?true:false, controlData, processedData[2]);

      initFollowBehavior(controlData.f);

      initAddEventLink(controlData.o, processedData[2], controlData.c);

      // no need to pass this point if program is empty
      if (!Object.size(controlData.a)) return;

      initTags(controlData.t);

      initCategories(controlData.ct);

      initHeadFilter(processedData[0], controlData.ct, controlData.t);

      initCalendar(processedData[1]);

      initPageNav();

      initListHandler();

      initMap(processedData[0]);

      addMobileDisplayBehavior(els('.pblock-head'), els('.pblock-body'), eh, {
        tabCanvas: params.elems.tabCanvas,
        listCanvas: params.elems.list.parentNode,
        widthThreshold: 760,
        triggeredEvents: { mobileOn: 'mobileon', mobileOff: 'mobileoff', tabActivated: 'tabactivated' },
        triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess' },
        templates: {
          listTab: '<div class="pblock-head"><i class="icon-list"></i><span><%= listTab %></span></div>'
        },
        labels: params.labels
      });

    }, params.control);

    eh.on('mobileon', function(){
      mobile = true;
      eh.trigger('resize');
    });

    eh.on('mobileoff', function(){
      eh.trigger('resize');
    });

    handleLock(params.elems.list, {lock: params.events.lock, unlock: params.events.unlock });

    eh.on('tabactivated', function(data){

      // that is the map
      if (data.i===0) eh.trigger('resize');

    });

    repeatingSectionsRemove(el('.list-items'), 'plis', eh, 'lhSuccess');

    setLinksElems(els(el('.title'), 'p'), {targetBlank: true, className: 'url'});

    _isAggregationEnabled(_initSourceMenu);

  },

  _initSocialShares = function() {

    handleShares({
      url: params.url,
      links: params.elems.shareLinks,
      fb: { appId: params.fbAppId, share: true },
      culture: params.lang
    });

    eh.trigger(params.events.mobileCheck, function(isMobile) {

      if (isMobile) {

        params.elems.mainActions.insertAdjacentHTML('afterbegin', '<li></li>');

        var button = handleDisplayButton(params.templates.actionsButton.replace('<%= label %>', params.labels.more), params.elems.shareLinks, {event: 'agendaactionstapped' });

        handleDisplayButton(button, params.elems.actions);

        handleDisplayButton(button, params.elems.shareCanvas);

        el(params.elems.mainActions, 'li').appendChild(button);

      }

    });

  },

  _initWidgetLink = function() {

    action(params.elems.widgetLink, {
      type: params.debug?'jsonp':'ajax'
    });

  },

  _initSourceMenu = function() {

    handleSourceMenu({
      debug: params.debug?true:false,
      resources: {
        list: params.resources.aggList,
        add: params.resources.aggAdd,
        remove: params.resources.aggRemove
      },
      anchor: params.elems.shareCanvas,
      templates: {
        programItem: params.templates.programItem,
        aggItem: params.templates.aggItem,
        aggLink: params.templates.aggLink
      },
      label: params.labels.aggLink
    });

  },

  initListHandler = function(){
      
    handleList(el('.list-items'), eh, {
      url: params.currentUrl,
      params: params.debug?{format: 'jsonp'}:{},
      ajax: !params.debug,
      triggerScroll: false,
      mainItem: 'article',
      templates: {
        article: params.templates.article,
        section: params.templates.section
      },
      scripts: {
        article: function(){},
        section: function(){}
      },
      triggerEvents: { load: 'load', loadPrevious: 'loadPrevious', loadNext: 'loadNext', getParams: 'getlistparams' },
      triggeredEvents: { loading: 'lhLoading', complete: 'lhComplete', success:'lhSuccess', fail: 'lhFail', lock: params.events.lock, unlock: params.events.unlock },
      anchor: 'params',
    });

  },

  initPageNav = function(){

    handleNav(el('.js_nav_previous'), el('.js_nav_next'), eh, {
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail'},
      triggeredEvents: { getNextPage: 'loadNext', getPreviousPage: 'loadPrevious' },
      url: params.currentUrl,
      initDisplay: params.initNav
    });

  },

  initHeadFilter = function(locations, categories, tags){ // locations needed because of the place names

    addHeadFilterBehavior({
      canvas: el('.js_head_filter'),
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail' },
      triggeredEvents: { filterClear: 'load' },
      locations: locations,
      categories: categories,
      tags: tags,
      labels: params.labels
    });

  },

  initCategories = function(categories) {

    handleCategories({
      canvas: el('.pcat'),
      categories: categories,
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail'},
      triggeredEvents: { newSelect: 'load' }
    });

  },

  initTags = function(tags) {

    if (!Object.size(tags)) return;

    handleTags({
      tags: tags,
      events: {newSelect: 'load', loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'fail', addTag: 'newtag'},
      canvas: el('.js_tag_widget'),
      decorate: true,
      labels: params.labels
    });

  },

  initMap = function(locations) {

    var locationList = [],
    today = new Date(),
    allPassed = true,
    m = maps.use('google');

    for (var slug in locations) {

      var location = locations[slug];
     
      locationList.push({
        id: slug,
        placename: location.placename,
        address: location.address,
        latitude: location.lat,
        longitude: location.lng,
        highlighted: false,
        upcoming: 0
      });

      forEach(location.dates, function(date) {
        if (today <= new Date(date)) {
          locationList[locationList.length-1].highlighted = true;
          locationList[locationList.length-1].upcoming++;
          allPassed = false;
        }
      });

      forEach(['image', 'city', 'country'] , function(optional) {
        if (location[optional]) locationList[locationList.length-1][optional] = location[optional];
      });

    }

    if (allPassed) forEach(locationList, function(location) {
      location.highlighted = true;
    });

    // create map with associated behaviors

    var mHandler = mapHandler(m, locationList, { events: {
      triggeredEvents: { onLocationSelect: 'markerselect', onBoundsChange: 'onboundschange', getParams: 'getlistparams' },
      triggerEvents: { disable: 'lhLoading', enable: 'lhSuccess' },
    }, iconRoot: params.iconRoot, elems: { map: params.elems.map, search: params.elems.search }, labels: params.labels });


    // map map events with list

    eh.on('markerselect', function(location) {
      eh.trigger('load', { location: location.id, neLat: null, neLng: null, swLat: null, swLng: null });
    });

    eh.on('onboundschange', function(frameParams) {
      eh.trigger('load', frameParams);
    });

  },

  initCalendar = function(dates) {

    createDateSelect(el('.pdates'), dates, eh, {
      triggerEvents: { disable: 'lhLoading', refresh: 'lhSuccess', enable: 'lhFail', mobileOn: 'mobileon', mobileOff: 'mobileoff' },
      triggeredEvents: { dateSelect: 'load' },
      mobile: mobile,
      lang: params.lang
    });

  },

  initEdition = function(main, controlData, editors) {

    addEditionBehavior(editors, {
      isOwner: controlData.o==getCurrentUsername(),
      isMain: main,
      user: getCurrentUsername(),
      edit: { template: '<a class="button smallest" href="#"><i class="icon-cog"></i><span>' + params.labels.edit + '</span></a>', action: params.resources.edit, appendTo: params.elems.edit, enabled: true }
    });

  },

  _isAggregationEnabled = function(callback) {

    if (params.debug) {
      if (params.debug.aggregator) return callback();
    } else {
      if (JSON.parse(Base64.decode(Cookies.get('cibul_session'))).agg) callback();
    }

  },

  initFollowBehavior = function(followers) {

    //handleContextMenu(el('.js_follow_link'), el('.js_follow_menu'), eh);

    handleCibulFollow(el('.actions'), followers, {
      user: getCurrentUsername(),
      follow: { template: '<a href="#"><i class="icon-arrow-right"></i><span>' + params.labels.cibulFollow + '</span></a>', link: params.links.follow },
      unfollow: { template: '<a href="#"><i class="icon-remove"></i><span>' + params.labels.cibulNoFollow + '</span></a>', link: params.links.unfollow },
      loginCallback: params.callbacks.login
    });

  },

  initAddEventLink = function(owner, editors, collaborative) {

    if (collaborative || (owner==getCurrentUsername()) || (typeof editors[getCurrentUsername()] != 'undefined')) {

      params.elems.mainActions.insertAdjacentHTML('afterbegin', '<li class="add-event"><a class="add-event small button green" href="' + params.links.addEvent + '">' + params.labels.addEvent + '</a></li>');

    }

  },

  getControlData = function(iterator, iterationFunctions, callback) {

    var processControlData = function(controlData) {

      callbackData = [];

      forEach(iterationFunctions, function(){
        callbackData.push({});
      });

      iterator(controlData.a, function(iterationItem){

        var i = iterationFunctions.length;

        while (i--) 
          iterationFunctions[i](callbackData[i], iterationItem);

      });

      callback(controlData, callbackData);

    };

    if (typeof params.control != 'string') return processControlData(params.control);

    remote.getJsonp(params.control, {data: {format: 'jsonp', getcontroldata: ''} }, function(responseType, data){
      processControlData(data);
    });
  },

  forEachLocationOfEachArticle = function(data, callback) {
    for (aIndex in data) {
      for (lIndex in data[aIndex].l) {
        callback({articleId: aIndex, article: data[aIndex], locationSlug: lIndex, location: data[aIndex].l[lIndex]});
      }
    }
  },

  getCurrentUsername = function() {

    if (typeof params.debug != 'undefined') if (params.debug) return params.debug.user;

    var sCookie = $.getSessionCookie();
    return sCookie.logged?sCookie.username:false;
  };


  addEvent(window, 'load', init);

};