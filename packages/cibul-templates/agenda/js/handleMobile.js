var addMobileDisplayBehavior = function(tabElems, contentElems, eventHandler, params) {

  params = extend({
    listCanvas: false, // the div hosting the list
    tabCanvas: false, // the div hosting the tabs
    widthThreshold: 740,
    activeTabClass: 'active',
    displayNoneClass: 'display-none',
    triggeredEvents: { mobileOn: 'mobileon', mobileOff: 'mobileoff', tabActivated: 'tabactivated'},
    triggerEvents: { loading: 'listloading', loadSuccess: 'success' },
  }, params);

  var mobile = null,
  _activeTab = null,
  listTab,
  init = function() {

    listTab = _createListTab();

    addEvent(window, 'resize', function(){

      _detectMobile();

    });

    for (var i=0; i<tabElems.length; i++) {

      _addTabClickBehavior(i);

    }

    _detectMobile();

    eventHandler.on(params.triggerEvents.loadSuccess, function(data) {

      if (mobile) _activateTab(false);

    });

  },
  _addTabClickBehavior = function(i) {

    addEvent(tabElems[i], 'click', function(){

      if (!mobile) return;

      _activateTab(i);
      eventHandler.trigger(params.triggeredEvents.tabActivated, {i: i});

    });

  },
  _detectMobile = function() {

    if ((document.width?document.width:window.innerWidth) <= params.widthThreshold) {

      if (mobile === null || mobile === false) eventHandler.trigger(params.triggeredEvents.mobileOn);

      // hide all tab contents

      mobile = true;

      _setMobileMode();

    } else {

      if (mobile === null || mobile === true) eventHandler.trigger(params.triggeredEvents.mobileOff);

      mobile = false;

      _unsetMobileMode();

    }

  },
  _deactivateTab = function(i) {
    
    _hideTabContent(i);
    removeClass(tabElems[i], params.activeTabClass);

    if (_activeTab == i) _activeTab = null;

  },
  _activateTab = function(i) {

    for (var otherI = 0; otherI<tabElems.length; otherI++) {
      _deactivateTab(otherI);
    };

    if (i!==false) {
      _hideList();
      removeClass(listTab, params.activeTabClass);
    } else {
      _activeTab = null;
      _showList();
      addClass(listTab, params.activeTabClass);
      return;
    }

    addClass(tabElems[i], params.activeTabClass);

    _showTabContent(i);

    _activeTab = i;

  },
  _showList = function() {
    removeClass(params.listCanvas, params.displayNoneClass);
  },
  _hideList = function() {
    addClass(params.listCanvas, params.displayNoneClass);
  },
  _setMobileMode = function() {

    _hideTabContent();

    _activateTab(false);

    removeClass(listTab, params.displayNoneClass);

  },
  _unsetMobileMode = function() {

    _showTabContent();

    addClass(listTab, params.displayNoneClass);

  },
  _showTabContent = function(i) {

    if (typeof i == 'undefined') {

      forEach(contentElems, function(contentElem) {
        removeClass(contentElem, params.displayNoneClass);
      });

    } else {

      removeClass(contentElems[i], params.displayNoneClass);

    }

  },
  _hideTabContent = function(i) {

    if (typeof i == 'undefined') {

      forEach(contentElems, function(contentElem) {
        addClass(contentElem, params.displayNoneClass);
      });

    } else {

      addClass(contentElems[i], params.displayNoneClass);

    }

  },
  _createListTab = function() {

    var canvas = document.createElement('div');
    canvas.innerHTML = new EJS({text: params.templates.listTab }).render(params.labels);

    var tab = canvas.childNodes[0];

    addEvent(tab, 'click', function(e) {
      if (null !== _activeTab) _activateTab(false);
    });

    params.tabCanvas.insertAdjacentElement('afterbegin', tab);

    return tab;

  }

  init();

};