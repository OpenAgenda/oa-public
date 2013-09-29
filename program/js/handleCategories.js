// handleCategories-0.1.js

var extractCategory = function(categories, item) {
  
  if (typeof item.article.c != 'undefined') if (item.article.c.length) 
    if (typeof categories[item.article.c] == 'undefined') categories[item.article.c] = 1;
    else categories[item.article.c]++;
    
};

var createCategoriesElement = function(parent, categories, template) {

  if (!Object.size(categories)) {

    var generalParent = parent.parentNode.parentNode;

    generalParent.removeChild(previousObject(parent.parentNode));
    generalParent.removeChild(parent.parentNode);

  } else {

    var ejsTemplate = new EJS({ text: template });

    var render = ejsTemplate.render({'categories': categories});

    parent.insertAdjacentHTML('afterbegin', render);

  }

};

var addCategoriesBehavior = function(element, eventHandler, params) {

  var activeIndex = -1, // index of selected category. -1 if none is selected
    enabled = true;

  var init = function() {

    params = extend({
      triggeredEvents: {newSelect: 'newSelect'},
      triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail'},
      activeClass: 'active',
      disabledClass: 'disabled'
    }, params);


    forEach(element.getElementsByTagName('a'), function(categoryElt) {

      // add category click behavior

      addEvent(categoryElt, 'click', function(e){

        _handleCategorySelect(e, categoryElt, function(selectedIndex, value) {
        
          if (selectedIndex == activeIndex || !enabled) return;

          eventHandler.trigger(params.triggeredEvents.newSelect, {category: value});

        });

      });

      // add Category remove behavior

      addEvent(nextObject(categoryElt), 'click', function(e) {
        
        if (enabled) eventHandler.trigger(params.triggeredEvents.newSelect, {category: null});

      });

    });

    // disable widget on load
    eventHandler.on(params.triggerEvents.loading, _disableWidget);

    // update widget on load success (could be triggered by anyone, so need to look at category value)
    eventHandler.on(params.triggerEvents.loadSuccess, function(params){

      _setActiveCategory(params.category);

      _enableWidget();

    });

    eventHandler.on(params.triggerEvents.loadFail, _enableWidget);

  };

  var _disableWidget = function() {
    addClass(element, params.disabledClass);
    enabled = false;
  };

  var _enableWidget = function() {
    removeClass(element, params.disabledClass);
    enabled = true;
  };

  var _setActiveCategory = function(category) {

    _getCategoryElement(category, function(index, catElem) {

      if (activeIndex!=-1) {
        removeClass(childObject(element, activeIndex), params.activeClass);
        activeIndex = -1;
      }

      if (catElem) {

        activeIndex = index;

        addClass(childObject(element, activeIndex), params.activeClass);

      };

    });

  };

  var _handleCategorySelect = function(e, elem, callback){

    preventDefault(e);

    var i = getChildIndex(elem.parentNode);

    callback(i, elem.innerHTML);

  };

  var _getCategoryElement = function(category, callback){

    var as = element.getElementsByTagName('a');
    
    var i = as.length;

    while (i--)
      if (as[i].innerHTML == category) break;

    if (i<0) return callback(i, false);

    callback(i, as[i].parentNode);

  };

  init();

};