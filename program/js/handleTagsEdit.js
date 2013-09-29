var handleTagsEdit = function(params) {

  params = extend({
    control: false,
    elem: false, // list elem
    debug: false,
    resources: { tagAdd: false, tagRemove: false },
    id: false, // id of the article
    timeout: 10000,
    templates: {
      tag: '<a class="url"><%= tag %></a><i class="icon-remove"></i>',
      menu: [
        '<div class="js_tag_menu tag-edit-menu">',
          '<h2><%= labels.tagEditMenu %></h2>', 
          '<ul class="js_current_tags current-tags">',
          '</ul>',
          '<div>',
            '<input class="js_tag_field" placeholder="<%= labels.addTag %>" type="text"/>',
            '<a class="small button js_tag_add"><%= labels.add %></a>',
            '<span class="indication js_hint"><%= labels.tagEditIndication %></span>',
          '</div>',
          //'<% if (frequentTags.length) { %>',
          //'<ul class="js_frequent_tags frequent-tags">',
          //'<% for (var i=0; i<frequentTags.length; i++) { %>',
          //'<li><a><%= frequentTags[i] %></a></li>',
          //'<% } %>',
          // '</ul>',
          // '<% } %>'
        '</div>'
      ].join(''),
      elemCanvas: '<ul></ul>',
      elemTag: '<a class="program-tag"><%= tag %></a>'
    },
    events: {
      tag: 'newtag'
    },
    classes: {
      error: 'error',
      tagCanvas: 'etags',
      canvas: 'evcnt',
      title: 'evtitle',
      listItem: 'pli'
    }
  }, params);

  var elems, locked = false, eh = sEventHandler.getInstance(),

  run = function() {

    // display tag edit menu
    _displayTagMenu();

    // elems used in form
    elems = {
      ok: getElementsByClassName('js_tag_add')[0],
      field: getElementsByClassName('js_tag_field')[0],
      tags: getElementsByClassName('js_current_tags')[0],
      hint: getElementsByClassName('js_hint')[0]
    };

    // add existing tags
    _addCurrentTags();

    // add tag add behavior
    _addAddBehavior();

  },

  _displayTagMenu = function() {

    var ejs = new EJS({ text: params.templates.menu });

    // get 10 most frequent tags of program
    //var frequentTags = [];

    lightbox({
      html: ejs.render({
        tags: params.tags,
        labels: params.labels,
        programTags: params.programTags
      }),
      classes: params.lightboxClasses
    });

  },

  _addCurrentTags = function() {

    forEach(params.tags, function(tag) {
      _addTagBehavior(_addTag(tag));
    });

  },

  _addAddBehavior = function() {

    addEvent(elems.ok, 'click', function(e) {

      if (locked) return;

      preventDefault(e);

      if (!elems.field.value.length) return;

      // if tag is already associated with event, display warning

      if (contains(params.tags, elems.field.value)) return _displayWarning(params.labels.tagExists);
      if (elems.field.value.indexOf(',')!=-1) return _displayWarning(params.labels.tagOne);

      var data = {tag: elems.field.value };
      if (params.debug) data.format = 'jsonp';

      elems.field.setAttribute('disabled', 'disabled');

      locked = true;
      
      sendGetMessage({
        debug: params.debug,
        url: params.resources.tagAdd.replace('aId', params.id),
        button: elems.ok,
        data: data,
        success: function(data) {
          
          // add tag to menu list and send event
          _addTagBehavior(_addTag(data.tag));

          _addTagToListItems(data.tag);

          eh.trigger(params.events.tag, {tag: data.tag});

          elems.field.value = '';
          elems.field.removeAttribute('disabled');

          if (params.control.a[params.id].t)
            params.control.a[params.id].t.push(data.tag);  
          else
            params.control.a[params.id].t = [data.tag];
          

          locked = false;

          _hideWarning();

        },
        timeout: params.labels.timeout
      });

    });

    var programTags = [];
    for (tag in params.programTags) programTags.push({tag: tag});

    handleSuggestions(elems.field, programTags, 'tag', '<a><%=tag%></a>', {
      contextMenuClass: 'wsq tag-suggestions'
    });
  },

  _addTag = function(tag) {

    var ejs = new EJS({text: params.templates.tag });

    var li = document.createElement('li');

    li.innerHTML = ejs.render({tag: tag});

    elems.tags.appendChild(li);

    return li;

  },

  _addTagBehavior = function(tagElem) {

    // remove the tag on clicking the cross

    addEvent(tagElem.getElementsByTagName('i')[0], 'click', function(e) {

      _removeTag(tagElem);

    });

  },

  _removeTag = function(tagElem) {

    var tag = tagElem.getElementsByTagName('a')[0].innerHTML;

    tagElem.getElementsByTagName('i')[0].style.display = 'none';

    var data = {tag: tag};
    if (params.debug) data.format = 'jsonp';

    sendGetMessage({
      debug: params.debug,
      url: params.resources.tagRemove.replace('aId', params.id),
      button: tagElem.getElementsByTagName('i')[0],
      data: data,
      success: function(data) {

        if (!data.success) return;

        _removeTagFromListItems(tag);

        tagElem.parentNode.removeChild(tagElem);

        for (var i=0; i<params.control.a[params.id].t.length; i++)
          if (params.control.a[params.id].t[i]==tag) return params.control.a[params.id].t.splice(i, 1);
            
      }
    });

  },

  _getElemTagCanvas = function(elem) {

    if (typeof elem == 'undefined') elem = params.elem;

    if (!getElementsByClassName(elem, params.classes.tagCanvas).length) return false;

    return getElementsByClassName(elem, params.classes.tagCanvas)[0].getElementsByTagName('ul')[0];

  },

  _getElementTitle = function(elem) {

    if (typeof elem == 'undefined') elem = params.elem;

    return getElementsByClassName(elem, params.classes.title)[0].getElementsByTagName('a')[0].innerHTML;    

  },

  _getMatchingListItems = function() {

    var matching = [], title = _getElementTitle();

    forEach(getElementsByClassName(params.classes.listItem), function(elem) {

      if (title==_getElementTitle(elem)) matching.push(elem);

    });

    return matching;

  },

  _addTagToListItems = function(tag) {

    forEach(_getMatchingListItems(), function(elem) {
      _addTagToListItem(elem, tag);
    });

  },

  _removeTagFromListItems = function(tag) {

    forEach(_getMatchingListItems(), function(elem) {
      _removeTagFromListItem(elem, tag);
    });

  },

  _addTagToListItem = function(elem, tag) {

    var tagsElem,
    ejs = new EJS({text: params.templates.elemTag });

    if (!_getElemTagCanvas(elem)) {

      var tagsElem = document.createElement('li');

      addClass(tagsElem, params.classes.tagCanvas);

      tagsElem.innerHTML = params.templates.elemCanvas;
    
      getElementsByClassName(elem, params.classes.canvas)[0].getElementsByTagName('ul')[0].appendChild(tagsElem);

    };

    tagsElem = _getElemTagCanvas(elem);

    var newTagElem = document.createElement('li');
    newTagElem.innerHTML = ejs.render({tag: tag});

    tagsElem.appendChild(newTagElem);

  },

  _removeTagFromListItem = function(elem, tag) {

    forEach(_getElemTagCanvas(elem).getElementsByTagName('a'), function(aElem) {
      if (aElem.innerHTML==tag) aElem.parentNode.parentNode.removeChild(aElem.parentNode);
    });

  },

  _displayWarning = function(message) {

    elems.hint.innerHTML = message;
    addClass(elems.hint, params.classes.error);

  };

  _hideWarning = function() {

    if (!hasClass(elems.hint, params.classes.error)) return;

    elems.hint.innerHTML = '';
  };

  run();

};