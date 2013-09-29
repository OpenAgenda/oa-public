var addMobileDisplayBehavior = function(tabElems, contentElems, eventHandler, params) {

  params = extend({
    widthThreshold: 740,
    activeTabClass: 'active',
    displayNoneClass: 'display-none',
    triggeredEvents: { mobileOn: 'mobileon', mobileOff: 'mobileoff', tabActivated: 'tabactivated'},
    triggerEvents: { loading: 'listloading' },
  }, params);

  var mobile = null,
  _activeTab = null,
  init = function() {

    addEvent(window, 'resize', function(){

      _detectMobile();

    });

    for (var i=0; i<tabElems.length; i++) {

      _addTabClickBehavior(i);

    };

    _detectMobile();

    eventHandler.on(params.triggerEvents.loading, function(){

      if (mobile) _deactivateTabs();

    });

  },
  _addTabClickBehavior = function(i) {

    addEvent(tabElems[i], 'click', function(){

      if (!mobile) return;

      if (_activeTab == i) {
        _deactivateTab(i);
      } else {
        _activateTab(i);
        eventHandler.trigger(params.triggeredEvents.tabActivated, {i: i});
      }

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
  _deactivateTabs = function() {

    for (var i=0; i<tabElems.length; i++) {
      _deactivateTab(i);
    }

  },
  _deactivateTab = function(i) {

    addClass(contentElems[i], params.displayNoneClass);
    removeClass(tabElems[i], params.activeTabClass);

    if (_activeTab == i) _activeTab = null;

  },
  _activateTab = function(i) {

    for (var otherI = 0; otherI<tabElems.length; otherI++) {
      _deactivateTab(otherI);
    };

    addClass(tabElems[i], params.activeTabClass);
    removeClass(contentElems[i], params.displayNoneClass);

    _activeTab = i;

  },
  _setMobileMode = function() {

    forEach(contentElems, function(contentElem) {
      addClass(contentElem, params.displayNoneClass);
    });

    if (_activeTab !== null) _activateTab(_activeTab);

  },
  _unsetMobileMode = function() {

    forEach(contentElems, function(contentElem) {
      removeClass(contentElem, params.displayNoneClass);
    });

  };

  init();

};