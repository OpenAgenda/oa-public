var runProgramBehavior = function(params) {

  var eh = sEventHandler.getInstance()
    , mobile = false
    , mapTabOpen = false;


  var init = function() {

    params = extend({
      url: false,
      currentUrl: false, // may include filtering variations
      hasFeature: false,
      debug: false,
      control: false, // required
      resources: { edit: '#edit', tagAdd: false, tagRemove: false, empty: false },
      events: { lock: 'lock', unlock: 'unlock' },
      elems: {
        list: el('.list-items'),
        map: el('.js_map_canvas'),
        locationsList: el('.js_location_list'),
        shareLink: el('.js_share'),
        shareCanvas: el('.js_share_menu'),
        actions: el('.js_program_actions')
      },
      lang: 'en',
      iconRoot: 'images/',
      labels: {tags: 'Tags', editors: 'editors', aggLink: 'use as sources', currentTags: 'Current Tags', programTags: 'Program Tags', addTag: 'Add a Tag', add: 'Add' }, // required
      links: { follow: false, unfollow: false, addEvent: false, editors: false },
      lightboxClasses: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons', button: 'small button'}
    }, params);

    params.templates = extend({ 
      article: false, 
      section: '<li class="plis"><h2><%= value %></h2></li>', 
      programItem: false, 
      aggItem: '<span><%= programItem %><span class="js_is_not"><i class="icon-plus"></i></span><span class="js_is"><i class="icon-ok"></i><i class="icon-remove"></i></span></span>',
      aggLink: '<a><i class="icon-share-alt"></i><span><%= label %></span></a>'
    }, params.templates?params.templates:{});

    _initSocialShares();

    getControlData(forEachLocationOfEachArticle, [extractCategory, extractLocation, extractDate, extractCurrentEditors, extractTags], function(controlData, processedData) {

      // merge actual editors with active ones
      forEach(controlData.e, function(editor) {
        if (typeof processedData[3][editor] == 'undefined') processedData[3][editor] = 0;
      });

      handleEmptyProgram({
        canvasElem: params.elems.list,
        control: controlData,
        editors: processedData[3],
        res: params.resources.empty,
        debug: params.debug,
        user: getCurrentUsername()
      });

      initEdition(controlData.m?true:false, controlData, processedData[4], processedData[3]);

      initAddEventLink(controlData.o, processedData[3], controlData.c);

      initFollowBehavior(controlData.f);

      // no need to pass this point if program is empty
      if (!Object.size(controlData.a)) return;

      initTags(processedData[4]);

      initCategories(processedData[0]);

      initHeadFilter(processedData[1]);

      initCalendar(processedData[2]);

      initPageNav();

      initListHandler();

      initMap(processedData[1]);

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
      mapTabOpen = data.i==2?true:false;
      eh.trigger('resize');
    });

    addMobileDisplayBehavior(el('.pblock-head'), el('.pblock-body'), eh, {
      widthThreshold: 740,
      triggeredEvents: { mobileOn: 'mobileon', mobileOff: 'mobileoff', tabActivated: 'tabactivated' },
      triggerEvents: { loading: 'lhLoading' }
    });

    repeatingSectionsRemove(el('.list-items'), 'plis', eh, 'lhSuccess');

    setLinksElems(els(el('.head'), 'p'), {targetBlank: true, linkClasses: 'url'});

    _isAggregationEnabled(_initSourceMenu);

  },

  _initSocialShares = function() {

    handleContextMenu(params.elems.shareLink, params.elems.shareCanvas, eh);

    handleShares({
      url: params.url,
      canvas: params.elems.shareCanvas,
      culture: params.lang
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
      anchor: params.elems.actions,
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

  initHeadFilter = function(locations){ // locations needed because of the place names

    addHeadFilterBehavior({
      canvas: el('.js_head_filter'),
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail' },
      triggeredEvents: { filterClear: 'load' },
      locations: locations,
      labels: params.labels
    });

  },

  initCategories = function(categories) {

    createCategoriesElement(
      el('.pcat'), categories,
      '<ul class="categories js_categories"><% for (index in categories) { %><li class="filter-item"><a><%= index %></a><i class="icon-remove"></i></li><% } %></ul>'
    );

    if (Object.size(categories)) addCategoriesBehavior(el('.js_categories'), eh, {
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail'},
      triggeredEvents: { newSelect: 'load' },
    });

  },

  initTags = function(tags) {

    if (!Object.size(tags)) return;

    handleTags({
      tags: tags,
      events: {newSelect: 'load', loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'fail', addTag: 'newtag'},
      canvas: el('.js_nav_widgets'),
      labels: params.labels
    });

  }

  initMap = function(locations) {

    var locationList = []
      , today = new Date()
      , allPassed = true
      , m = maps.use('google');

    for (slug in locations) {

      var location = locations[slug];
     
      locationList.push({
        id: slug,
        placename: location.placename,
        address: location.address,
        latitude: location.lat,
        longitude: location.lng,
        highlighted: false
      });

      forEach(location.dates, function(date) {
        if (today <= new Date(date)) {
          locationList[locationList.length-1].highlighted = true;
          allPassed = false;
        }
      });

    };

    if (allPassed) forEach(locationList, function(location) {
      location.highlighted = true;
    });

    // create map with associated behaviors

    var mHandler = mapHandler(m, params.elems.map, locationList, { events: {
      triggeredEvents: { onLocationSelect: 'markerselect', onBoundsChange: 'onboundschange', getParams: 'getlistparams' },
      triggerEvents: { disable: 'lhLoading', enable: 'lhSuccess' /* selectLocation: 'load', unselectLocation: options.events.locationSelectCancel, */  },
    }, iconRoot: params.iconRoot });


    // map map events with list

    eh.on('markerselect', function(location) {
      eh.trigger('load', { location: location.id });
    });

    eh.on('onboundschange', function(frameParams) {
      eh.trigger('load', frameParams);
    });

    addLocationListBehavior(params.elems.locationsList, locations, eh, {
      triggerEvents: { loading: 'lhLoading', loadSuccess: 'lhSuccess', loadFail: 'lhFail', resize: 'resize'},
      triggeredEvents: { locationSelect: 'load' },
    });

  },

  initCalendar = function(dates) {

    createDateSelect(getElementsByClassName(document, 'pdates')[0], dates, eh, {
      triggerEvents: { disable: 'lhLoading', refresh: 'lhSuccess', enable: 'lhFail', mobileOn: 'mobileon', mobileOff: 'mobileoff' },
      triggeredEvents: { dateSelect: 'load' },
      mobile: mobile,
      lang: params.lang
    });

  },

  initEdition = function(main, controlData, tagsData, editors) {

    addEditionBehavior(el('.list-items'), 'pli', editors, eh, {
      triggerEvents: { refresh: 'lhSuccess' },
      isOwner: controlData.o==getCurrentUsername(),
      isMain: main,
      user: getCurrentUsername(),
      canvas: '<span class="edit-post"><i class="icon-cog"></i><span>' + params.labels.edit + '</span></span><ul class="wsq edit-post-menu"></ul>',
      templates: {
        remove: '<i class="icon-remove"></i><span>' + params.labels.remove + '</span>',
        edit: '<i class="icon-edit"></i><span>' + params.labels.edit + '</span>',
        category: '<i class="icon-bookmark"></i><span>' + params.labels.editCategory + '</span>',
        tag: '<i class="icon-tags"></i><span>' + params.labels.addTag + '</span>'
      },
      labels: params.labels,
      edit: { template: '<a href="#"><i class="icon-cog"></i><span>' + params.labels.edit + '</span></a>', action: params.resources.edit, appendTo: el('.actions'), enabled: true },
      admin: { template: '<a href="#"><i class="icon-edit"></i><span>' + params.labels.admin + '</span></a>', action: params.resources.admin, appendTo: el('.actions'), enabled: !!params.hasFeature },
      editors: { link: params.links.editors, appendTo: el('.actions') },
      actionCallback: function(name, id, elem) {

        if (name=='tag') return handleTagsEdit({
          control: controlData,
          debug: params.debug,
          tags: controlData.a[id].t?controlData.a[id].t:[],
          resources: { tagAdd: params.resources.tagAdd, tagRemove: params.resources.tagRemove },
          programTags: tagsData,
          elem: elem,
          labels: params.labels,
          lightboxClasses: params.lightboxClasses,
          id: id
        });

        params.callbacks.edit(name, id);
      }
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

    handleContextMenu(el('.js_follow_link'), el('.js_follow_menu'), eh);

    handleCibulFollow(el('.js_follow_menu'), followers, {
      user: getCurrentUsername(),
      follow: { template: '<a href="#"><i class="icon-arrow-right"></i><span>' + params.labels.cibulFollow + '</span></a>', link: params.links.follow },
      unfollow: { template: '<a href="#"><i class="icon-remove"></i><span>' + params.labels.cibulNoFollow + '</span></a>', link: params.links.unfollow },
      loginCallback: params.callbacks.login
    });

  },

  initAddEventLink = function(owner, editors, collaborative) {

    if (collaborative || (owner==getCurrentUsername()) || (typeof editors[getCurrentUsername()] != 'undefined'))
      el('.js_program_actions').insertAdjacentHTML('afterbegin', '<li class="add-event"><a class="add-event smallest button" href="' + params.links.addEvent + '"><i class="icon-plus"></i><span>' + params.labels.addEvent + '</span></a></li>');

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