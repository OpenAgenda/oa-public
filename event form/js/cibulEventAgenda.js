var cibulEventAgenda = function(params) {

  params = extend({
    uid: false,
    selectors: {
      canvas: '.js_form_canvas'
    },
    classes: {
      active: 'selected',
      tags: 'selectable form-section slist tags',
      categories: 'selectable form-section slist categories',
      bottom: 'separator'
    },
    templates: {
      tags: '<h2><%= title %></h2><p><%= label %></p><ul></ul>',
      categories: '<h2><%= title %></h2><p><%= label %></p><ul></ul>',
      tag: '<span><%= label %></span>',
      category: '<span><%= label %></span>',
      main: '<div class="separator"></div>'
    },
    labels: {
      tagTitle: 'Agenda Tags',
      tagInfo: 'Select the tags of the agenda which best define your event',
      categoryTitle: 'Agenda Category',
      categoryInfo: 'Select the category of the agenda which best corresponds to your event'
    },
    events: {
      fetch: 'eagendafetch',
      send: 'eagendawrite'
    },
    tags: false,
    categories: false
  }, params);

  var eh = sEventHandler.getInstance(), tagCanvas, catCanvas, selection = {tags: [], category: false, uid: params.uid }, mCanvas,

  init = function() {

    if (!Object.size(params.categories) && !Object.size(params.tags)) return; // nothing to do here

    eh.trigger(params.events.fetch, {
      uid: params.uid,
      callback: function(data) {

        if (!data) return;

        selection.category = data.category?data.category:null;

        selection.tags = data.tags?data.tags:[];

        _createMainCanvas();

        if (Object.size(params.tags)) {

          tagCanvas = _createCanvas('tags');

          forEach(params.tags, _addTagItem);

        }

        if (Object.size(params.categories)) {

          catCanvas = _createCanvas('categories');

          forEach(params.categories, _addCategoryItem);

        }

      }
    });

  },

  _addTagItem = function(item) {

    var li = document.createElement('li');

    li.innerHTML = new EJS({text: params.templates.tag }).render({label: item.label });

    if (contains(selection.tags, item.slug)) addClass(li, params.classes.active);

    addEvent(li, 'click', function(e) {

      var tagIndex = -1;

      for (var i = selection.tags.length - 1; i >= 0; i--) {
        if (selection.tags[i]==item.slug) {
          tagIndex = i;
          break;
        }
      }

      if (tagIndex == -1) { // add tag to selection
        
        selection.tags.push(item.slug);

        addClass(li, params.classes.active);
        
      } else { // remove tag from selection

        selection.tags.splice(tagIndex, 1);

        removeClass(li, params.classes.active);

      }

      eh.trigger(params.events.send, selection);

    });

    el(tagCanvas, 'ul').appendChild(li);

  },

  _addCategoryItem = function(item) {

    var li = document.createElement('li');

    li.innerHTML = new EJS({text: params.templates.category }).render({ label: item.label });

    if (item.slug==selection.category) addClass(li, params.classes.active);

    addEvent(li, 'click', function(e) {

      // remove current active item
      if (selection.category) {
        
        for (var i = params.categories.length - 1; i >= 0; i--) {
          if (params.categories[i].slug==selection.category) {
            
            removeClass(els(catCanvas, 'li')[i], params.classes.active);
            break;

          }
        }

      }

      if (item.slug == selection.category) {

        delete selection.category;

      } else {

        selection.category = item.slug;

        addClass(li, params.classes.active);

      }

      eh.trigger(params.events.send, selection);

    });

    el(catCanvas, 'ul').appendChild(li);

  },

  _createMainCanvas = function() {

    mCanvas = document.createElement('div');

    mCanvas.innerHTML = new EJS({text: params.templates.main}).render();

    el(params.selectors.canvas).appendChild(mCanvas);

  },

  _createCanvas = function(obj) {

    var canvas = document.createElement('div');

    canvas.innerHTML = new EJS({text: params.templates[obj]}).render({ categories: params.categories, tags: params.tags, label: params.labels[obj=='tags'?'tagInfo':'categoryInfo'], title: params.labels[obj=='tags'?'tagTitle':'categoryTitle'] });

    addClass(canvas, params.classes[obj]);

    mCanvas.appendChild(canvas);

    mCanvas.insertAdjacentElement('afterbegin', canvas);

    return canvas;

  };

  init();

};