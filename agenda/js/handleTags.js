var handleTags = function(params) {

  // the handle tag knows the current tag selection and refreshes it at every page reload
  // but allows only for the selection of one tag at a time

  params = extend({
    tags: false, // compulsory: list of objects with slugs and labels
    usedSlugs: false,
    classes: { disabled: 'disabled', active: 'active', item: 'filter-item', list: 'js_tags' },
    events: {
      newSelect: 'load',
      loading: 'loading', // when list is loading
      loadSuccess: 'success', // when load is successful
      loadFail: 'fail', // when load has failed
      addTag: 'newtag'
    },
    attributes: {
      slug: 'data-slug'
    },
    templates: {
      head: '<div class="pblock-head at5"><i class="icon-tags"></i><span><%= tags %></span></div>',
      body: '<div class="pblock-body"><ul class="ptags content js_tags"></ul></div>',
      item: '<a href="#" data-slug="<%= slug %>"><%= label %></a>'
    },
    canvas: false,
    decorate: false, // decorate widget with a head and body before adding tag items
  }, params);

  var enabled = true, element, selection = [], tag = false, usedSlugs = [],

  eh = sEventHandler.getInstance(),

  run = function() {

    if (params.usedSlugs) usedSlugs = params.usedSlugs;

    element = _createElement();

    for (var i in params.tags) {

      if (!params.usedSlugs) usedSlugs.push(params.tags[i].s); // if a sublist was not given, widget should show all tags

      if (!params.usedSlugs || contains(params.usedSlugs, params.tags[i].s)) {

        var tag = _createTag({slug: params.tags[i].s, label: params.tags[i].t});

        _addTagBehavior(tag);

        element.appendChild(tag);

      }

    }
  
    eh.on(params.events.loadSuccess, function(data) {

      selection = (typeof data.tags == 'undefined')?[]:data.tags; //one for now

      if ((typeof selection == 'string') && (selection.indexOf(',') != -1)) {

        selection = selection.split(',');

      } else if (typeof selection == 'string') {

        selection = [selection];

      }

      forEach(els(element, 'li'), function(tagElem) {

        if (contains(selection, el(tagElem, 'a').getAttribute(params.attributes.slug))) {

          if (!hasClass(tagElem, params.classes.active)) addClass(tagElem, params.classes.active);

        } else {

          if (hasClass(tagElem, params.classes.active)) removeClass(tagElem, params.classes.active);

        }

      });

      _enable();

    });

    eh.on(params.events.loading, function(data) {
      _disable();
    });

    return {
      getTags: function() { return params.tags; },
      removeTag: _removeTag,
      createTag: _createTag
    };

  },

  _createTag = function(tag) {

    var li = document.createElement('li'),
    
    ejs = new EJS({text: params.templates.item });
    
    li.innerHTML = ejs.render(tag);

    addClass(li, params.classes.item);

    return li;
  },

  _removeTag = function(slug) {

    if (usedSlugs.indexOf(slug) !== -1) usedSlugs.slice(usedSlugs.indexOf(slug), 1);
    
    var tagItems = els(element, 'li');

    for (var i in tagItems) {

      if (tagItems[i].getAttribute(params.attributes.slug) == slug) {

        element.removeChild(tagItems[i]);

        return;

      }
    }

  },

  _addTagBehavior = function(tagElem) {

    addEvent(tagElem, 'click', function(e) {

      preventDefault(e);

      if (hasClass(tagElem, params.classes.active)) {

        _tagUnselect(tagElem);

      } else {

        _tagSelect(tagElem);

      }

    });

  },

  _tagSelect = function(tagElem) {

    if (!enabled) return;

    // keep in selection only tags not in widget set
    
    var newSelection = [];
    
    forEach(selection, function(selTag) {
      if (usedSlugs.indexOf(selTag) == -1) newSelection.push(selTag);
    });

    newSelection.push(el(tagElem, 'a').getAttribute(params.attributes.slug));

    eh.trigger(params.events.newSelect, {tags: newSelection});

  },

  _tagUnselect = function(tagElem) {

    if (!enabled) return;

    var deadTag = el(tagElem, 'a').getAttribute(params.attributes.slug);

    selection.splice(selection.indexOf(deadTag), 1);

    eh.trigger(params.events.newSelect, {tags: selection.length?selection:null });

  },

  _enable = function() {

    removeClass(element, params.classes.disabled);

    enabled = true;

  },

  _disable = function() {

    addClass(element, params.classes.disabled);

    enabled = false;

  },

  _createElement = function() {

    if (!params.decorate) {

      var canvas = document.createElement('ul');

      params.canvas.appendChild(canvas);

      return canvas;
      
    };
    

    var canvas = document.createElement('div'),
    
    tagElem;

    canvas.innerHTML = new EJS({text: params.templates.head }).render(params.labels) + new EJS({text: params.templates.body}).render(params.labels);

    while (canvas.childNodes.length) {

      if (els(canvas.childNodes[0], '.' + params.classes.list).length) tagElem = el(canvas.childNodes[0], '.' + params.classes.list);

      params.canvas.insertAdjacentElement('beforebegin', canvas.childNodes[0]);

    }

    params.canvas.parentNode.removeChild(params.canvas);

    return tagElem;
  };

  return run();

};