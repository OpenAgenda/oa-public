var extractTags = function(tags, item) {

  if (typeof item.article.t == 'undefined') return;

  forEach(item.article.t, function(tag) {
    if (typeof tags[tag] == 'undefined') tags[tag] = 0;
    tags[tag]++;
  });

};

var handleTags = function(params) {

  params = extend({
    classes: { disabled: 'disabled', active: 'active', item: 'filter-item', list: 'js_tags' },
    events: {
      newSelect: 'load',
      loading: 'loading', // when list is loading
      loadSuccess: 'success', // when load is successful
      loadFail: 'fail', // when load has failed
      addTag: 'newtag'
    },
    templates: {
      head: ['<div class="pblock-head at5"><i class="icon-tags"></i><span>', params.labels.tags,'</span></div>'].join(''),
      body: '<div class="pblock-body"><ul class="ptags content js_tags"></ul></div>',
      item: '<a href="#"><%= tag %></a><button>&times</button>'
    },
    canvas: false
  }, params);

  var enabled = true, element,

  eh = sEventHandler.getInstance(),

  run = function() {

    element = _createElement();

    params.canvas.parentNode.removeChild(params.canvas);

    for (tag in params.tags)
      _addTagBehavior(_addTag(tag));

    eh.on(params.events.loadSuccess, function(data) {

      data.tag?_setActiveTag(data.tag):_removeActiveTag();

      _enable();

    });

    eh.on(params.events.loading, function(data) {
      _disable();
    });

    eh.on(params.events.addTag, function(data) {

      if (typeof params.tags[data.tag] == 'undefined') {
        params.tags[data.tag] = 1;
        _addTagBehavior(_addTag(data.tag));
      }
      else
        params.tags[data.tag]++;

    });

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

    var canvas = document.createElement('div')
      , tagElem;

    canvas.innerHTML = params.templates.head + params.templates.body;

    while (canvas.childNodes.length) {

      if (els(canvas.childNodes[0], '.' + params.classes.list).length) tagElem = el(canvas.childNodes[0], '.' + params.classes.list);

      params.canvas.insertAdjacentElement('beforebegin', canvas.childNodes[0]);

    }

    return tagElem;
  },

  _addTag = function(tag) {

    var li = document.createElement('li')
      , ejs = new EJS({text: params.templates.item });
    
    li.innerHTML = ejs.render({tag: tag});

    addClass(li, params.classes.item);

    element.appendChild(li);

    return li;
  },

  _addTagBehavior = function(tagElem) {

    var a = el(tagElem, 'a'),
        button = el(tagElem, 'button');
      
      addEvent(a, 'click', function(e) {
        preventDefault(e);
        _tagSelect(tagElem, a.innerHTML);
      });

      addEvent(button, 'click', function(e) {
        preventDefault(e);
        _tagUnselect();
      });

  },

  _tagSelect = function(li, tag) {

    if (!enabled) return;

    eh.trigger(params.events.newSelect, {tag: tag});

  },

  _tagUnselect = function() {
    if (!enabled) return;

    eh.trigger(params.events.newSelect, {tag: null});
  }

  _setActiveTag = function(tag) {

    _removeActiveTag();

    forEach(element.getElementsByTagName('a'), function(a) {
      if (a.innerHTML==tag) 
        addClass(a.parentNode, params.classes.active);
    });

  },

  _removeActiveTag = function() {

    var activeElems = getElementsByClassName(element, params.classes.active);

    if (!activeElems.length) return;

    removeClass(activeElems[0], params.classes.active);

  }

  run();

};