var handleTagsSelect = function(params) {

  params = extend({
    elem: false, // where to put dom stuff
    codeElem: false,
    ctl: false,
    attributes: {
      slug: 'data-slug',
      config: 'data-cbctl'
    },
    classes: {},
    templates: {
      canvas: '<ul></ul>',
      option: '<li class="line" data-slug="<%= s %>"><input checked="checked" type="checkbox"/><label><%= t %></label></li>'
    },
    onSelectionChange: false
  }, params);

  var total, selectedSlugs = [], UID = 0, TAGS = 1, canvas, config

  run = function() {
    
    var tags = params.ctl.t;

    total = tags.length;

    if (!total) return;

    _createCanvas();

    forEach(tags, function(tag) {

      selectedSlugs.push(tag.s);

      _createOption(tag);

    });

  },

  _removeTag = function(tag) {

    selectedSlugs.splice(selectedSlugs.indexOf(tag.s),1);

    if (params.onSelectionChange) params.onSelectionChange(config);

    _updateCode();

  },

  _addTag = function(tag) {

    selectedSlugs.push(tag.s);

    if (params.onSelectionChange) params.onSelectionChange(config);

    _updateCode();

  },

  // pick the code from the field, shove it in an element, use dom to update config attribute

  _updateCode = function() {

    var code = params.codeElem.value;

    var div = document.createElement('div');

    div.innerHTML = code;

    config = el(div, 'div').getAttribute(params.attributes.config).split('|');

    if (selectedSlugs.length == total) {

      if (config.length == 2) config.pop();

    } else {

      var newSlugList = selectedSlugs.join(',');

      if (config.length < 2) {
        config.push(newSlugList);
      } else {
        config[TAGS] = newSlugList;
      }

    }

    el(div, 'div').setAttribute(params.attributes.config, config.join('|'));

    params.codeElem.value = div.innerHTML;

  },

  _createCanvas = function() {

    params.elem.innerHTML = params.templates.canvas;

    canvas = childObject(params.elem, 0);

    if (params.classes.canvas) canvas.className = params.classes.canvas;

  },

  _createOption = function(tag) {

    var ul = document.createElement('ul');

    ul.innerHTML = new EJS({text: params.templates.option }).render(tag);

    var li = el(ul, 'li');

    addEvent(li, 'click', function(e) {

      if (!contains(selectedSlugs, tag.s)) {

        _addTag(tag);

        el(li, 'input').checked = true;

      } else {

        _removeTag(tag);

        el(li, 'input').checked = false;

      }
      
    });

    canvas.appendChild(el(ul, 'li'));

  };

  run();

};