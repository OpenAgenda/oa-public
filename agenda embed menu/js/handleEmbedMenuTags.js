var runTagsBehavior = function(params) {

  params = extend({
    selectors: {
      checkboxCanvas: '.js_tag_options',
      codeField: '.js_tags_code'
    },
    attributes: {
      slug: 'data-slug',
      config: 'data-cbctl'
    },
    classes: {
      active: 'active'
    },
    templates: {
      option: '<li class="line" data-slug="<%= s %>"><input checked="checked" type="checkbox"/><label><%= t %></label></li>'
    }
  }, params);

  var total, selectedSlugs = [], UID = 0, KEY = 1, TAGS = 2, handler,

  run = function() {
    
    var eh = sEventHandler.getInstance();

    addClass(el('.cibulTags'), 'cbpgtg');

    cibulEmbedWidget.controllers.tags(el('.cbpgtg'), function(tagHandler) {

      handler = tagHandler;

      var tags = handler.getTags();

      total = tags.length;

      forEach(tags, function(tag) {

        selectedSlugs.push(tag.s);

        _createOption(tag);

      });

      addClass(el(el('.cibulTags'), 'li'), params.classes.active);

      eh.trigger('showtags');

    });

  },

  _removeTag = function(tag) {

    selectedSlugs.splice(selectedSlugs.indexOf(tag.s),1);

    handler.removeTag(tag.s);

    _updateCode();

  },

  _addTag = function(tag) {

    selectedSlugs.push(tag.s);

    handler.createTag({slug: tag.s, label: tag.t});

    _updateCode();

  },

  // pick the code from the field, shove it in an element, use dom to update config attribute

  _updateCode = function() {

    var codeField = el(params.selectors.codeField),

    code = codeField.value;

    var div = document.createElement('div');

    div.innerHTML = code;

    var config = el(div, 'div').getAttribute(params.attributes.config).split('|');

    if (selectedSlugs.length == total) {

      if (config.length == 3) config.pop();

    } else {

      var newSlugList = selectedSlugs.join(',');

      if (config.length < 3) {
        config.push(newSlugList);
      } else {
        config[2] = newSlugList;
      }

    }

    el(div, 'div').setAttribute(params.attributes.config, config.join('|'));

    codeField.value = div.innerHTML;

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

    el(params.selectors.checkboxCanvas).appendChild(el(ul, 'li'));

  };

  run();

};