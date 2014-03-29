var handleCategories = function(params) {

  params = extend({
    canvas: false,
    templates: {
      main: '<ul class="categories js_categories"></ul>',
      category: '<li class="js_category filter-item" data-slug="<%= slug %>"><a><%= category %></a><i class="icon-remove"></i></li>'
    },
    triggeredEvents: {newSelect: 'newSelect'},
    triggerEvents: {loading: 'loading', loadSuccess: 'success', loadFail: 'fail'},
    classes: {
      disabled: 'disabled',
      active: 'active'
    },
    selectors: {
      categories: '.js_categories',
      category: '.js_category'
    },
    categories: [],
    removeParent: true
  }, params);

  var elem, enabled = true, eh = sEventHandler.getInstance(),

  init = function() {

    if (!params.categories.length) return _removeCanvas();

    _createElement();

    forEach(params.categories, function(cat) {

      var category = {slug: cat.s, category: cat.c },
      
      catElem = _createCategoryElement(category);

      addEvent(catElem, 'click', function(e) {
        
        preventDefault(e);

        if (enabled) eh.trigger(params.triggeredEvents.newSelect, { category: category.slug });

      });

      el(params.canvas, params.selectors.categories).appendChild(catElem);

    });

    eh.on(params.triggerEvents.loading, _disable);

    // update widget on load success (could be triggered by anyone, so need to look at category value)
    eh.on(params.triggerEvents.loadSuccess, function(params){
      
      _setActiveCategory(params.category);

      _enable();

    });


  },

  _createElement = function() {

    var div = document.createElement('div');

    div.innerHTML = new EJS({text: params.templates.main }).render();

    elem = div.childNodes[0];

    params.canvas.appendChild(elem);

  },

  _removeCanvas = function() {

    if (!params.removeParent) return;

    var generalParent = params.canvas.parentNode.parentNode;

    generalParent.removeChild(previousObject(params.canvas.parentNode));
    generalParent.removeChild(params.canvas.parentNode);

  },

  _createCategoryElement = function(category) {

    var ul = document.createElement('ul');

    ul.className = params.classes.category;

    ul.innerHTML = new EJS({text: params.templates.category }).render(category);

    return ul.childNodes[0];

  },

  _enable = function() {

    enabled = true;

    removeClass(elem, params.classes.disabled);

  },

  _disable = function() {

    enabled = false;

    addClass(elem, params.classes.enabled);

  },

  _setActiveCategory = function(categorySlug) {

    forEach(els(elem, params.selectors.category), function(catElem) {

      (catElem.getAttribute('data-slug')==categorySlug?addClass:removeClass)(catElem, params.classes.active);

    });

  };

  init();

};