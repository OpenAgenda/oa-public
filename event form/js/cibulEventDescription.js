var cibulEventDescription = function(params) {

  params = extend({
    events: {
      fetch: 'edescriptionfetch',
      send: 'edescriptionfieldsend',
      remove: 'edescriptionfieldremove',
      heightChange: 'heightchange'
    },
    templates: {
      languageList: '<div class="languages action"><ul class="language-list js_language_select"></ul><div class="add-language js_language_add"><a><i class="icon-plus"></i></a><div class="menu"><ul></ul></div></div></div>',
      languageItem: '<li><span><%= language %></span></li>',
      languageRemoveItem: '<a href="#">&#215;</a>',
      canvas: '',
    },
    fields: [
      { name: 'title', type: 'text', limit: 140 },
      { name: 'description', type: 'textarea', limit: 200, rows: 2 },
      { name: 'tags', type: 'text', limit: 255 },
      { name: 'freeText', type: 'textarea', limit: 10000, rows: 6 }
    ],
    labels: {
      title: { label: 'Title', info: 'Type in the title of your event'},
      description: { label: 'Description', info: 'Type a short description' },
      tags: { label: 'Tags', info: 'Type the key words best describing your event'},
      freeText: { label: 'Free Text', info: 'Type in anything you want' },
      remaining: '%count% characters left'
    },
    selectors: {
      languageSelector: '.js_language_select',
      languageAddMenu: '.js_language_add'
    },
    languages : {},
    activeClass: 'active',
    defaultLanguage: 'en',
    classes: {
      description: 'description',
      field: 'input-fields',
      languageTab: 'action'
    },
    initValidate: false
  }, params);

  var eh = sEventHandler.getInstance(),
    canvas = false,            // canvas for the description widget
    fields = {},               // fields element, contains event input fields
    counters = {},
    widgets = {},
    languageCanvas = false,  // language selector element, includes language tabs and selection menu
    addMenu = false,           // contains the language selection elements
    currentLang = false,       // language displayed on the form, false when nothing is displayed

  init = function() {

    _initCanvas();

    _render();

  },

  _initCanvas = function() {

    params.elems.canvas.appendChild(canvas = _lib.createElement('ul', params.templates.canvas));

    canvas.className = params.classes.description;

  },

  _render = function(language) {

    // fetch description data from cibulEvent
    eh.trigger(params.events.fetch, function(data) {

      var languages = _lib.extractLanguages(data);

      if (!languages.length) return _addField(params.defaultLanguage);

      if (typeof language == 'undefined') language = languages[0];

      var tab = _renderLanguageCanvas(language, languages);

      _renderFields(language, tab);

    });

  },

  _clear = function() {

    var name;

    if (canvas) _lib.removeChildren(canvas);

    fields = {};
  },

  _renderLanguageCanvas = function(selectedLanguage, currentLanguages) {

    // if there is only one, don't display it. 

    languageCanvas = _lib.createElement('li', params.templates.languageList);

    var languageSelector = el(languageCanvas, params.selectors.languageSelector)
      , addMenuCanvas = el(languageCanvas, params.selectors.languageAddMenu)
      , addMenuLink = el(addMenuCanvas, 'a')
      , addMenu = el(addMenuCanvas, 'ul');


    var tab = _renderLanguageTabs(languageSelector, selectedLanguage, currentLanguages);
    
    _renderSelectionMenu(addMenu, currentLanguages);

    canvas.insertAdjacentElement('afterbegin', languageCanvas);

    handleContextMenu(addMenuLink, addMenu, sEventHandler.getInstance(), {left: false});

    return tab;

  },

  _renderFields = function(language, tab) {

    // first, display corresponding tab as active

    forEach(getElementsByClassName('active'), function(activeElem) {
      removeClass(activeElem, params.activeClass);
    });

    addClass(tab, params.activeClass);


    // clear field elements from the form

    for (name in widgets) {
      widgets[name].remove();
      counters[name].remove();
    }
      

    var values = {title: '', description: '', tags: '', freeText: ''};

    // fetch and display the field data for language

    eh.trigger(params.events.fetch, function(data) {

      if (typeof language == 'undefined') language = _lib.extractLanguages(data)[0];

      forEach(params.fields, function(field) {

        var li = document.createElement('li');

        li.className = params.classes.field;

        if (data[field.name] && data[field.name][language]) values[field.name] = data[field.name][language];

        var widgetParams = {
          value: values[field.name],
          label: params.labels[field.name].label,
          placeholder: params.labels[field.name].label,
          name: field.name, 
          canvas: li, 
          info: params.labels[field.name].info,
        };

        if (field.rows) widgetParams.rows = field.rows;

        widgets[field.name] = new inputWidgets[field.type](widgetParams);

        widgets[field.name].setOnUpdate(function(value) {
          
          _syncContent(field.name, language, value, function(err) {
              
            if (err)
              widgets[field.name].setError(err);
            else 
              widgets[field.name].setValid();

          });

        }, params.initValidate);

        counters[field.name] = inputCounter(widgets[field.name].getElements()[1], field.limit, {canvas: li, className: "info", label: params.labels.remaining });

        canvas.appendChild(li);
          
      });

      eh.trigger(params.events.heightChange);

      currentLang = language;

    });

  },

  _syncContent = function(fieldName, language, value, callback) {

    eh.trigger(params.events.send, {
      name: fieldName, 
      language: language, 
      value: typeof value == 'undefined'?fields[fieldName].getElementsByTagName(contains(['freeText', 'description'],fieldName)?'textarea':'input')[0].value:value,
      callback: callback
    });

  };

  /**
   * generate the language selection tabs for 'languages', apply behavior, put them in 'elem'
   */
  _renderLanguageTabs = function(elem, selectedLanguage, languages) {

    var activeTab = false;

    _lib.removeChildren(elem);

    // add language tabs

    forEach(languages, function(language) {

      var tab = _lib.createElement('div', params.templates.languageItem, {language: params.languages[language]}).childNodes[0];

      if (language == selectedLanguage) activeTab = tab;

      addEvent(tab.childNodes[0], 'click', function(e) {

        _renderFields(language, tab);

      });

      // display remove only if more than one language is displayed

      if (languages.length > 1) {

        var remove = _lib.createElement('div', params.templates.languageRemoveItem).childNodes[0];

        tab.appendChild(remove);

        addEvent(remove, 'click', function() {
          _removeFields(language);
        });

      }

      elem.appendChild(tab);

    });


    return activeTab;

  },

  /**
    * sets new language list items with behavior to the canvas elem, excluding already existing languages
    */
  _renderSelectionMenu = function(elem, currentLanguages) {

    _lib.removeChildren(elem);

    // keep languages that are not in the current set
    
    var selectionLanguages = [];

    for (var language in params.languages) 
      if (!contains(currentLanguages, language)) selectionLanguages.push(language);

    forEach(selectionLanguages, function(language) {

      var li = _lib.createElement('div', params.templates.languageItem, {language: params.languages[language]}).childNodes[0];

      addEvent(li, 'click', function() {
        _addField(language);
      });

      elem.appendChild(li);

    });

  },

  _addField = function(language) {

    _syncContent('title', language, '');

    _clear();

    _render(language);

  };

  _removeFields = function(language) {

    eh.trigger(params.events.remove, {language: language});

    _clear();

    _render();

  },

  _lib = {

    removeChildren: function(elem) {
      while (elem.childNodes.length) elem.removeChild(elem.childNodes[0]);
    },

    removeElement: function(elem) {
      elem.parentNode.removeChild(elem);
    },

    createElement: function(type, template, values) {
      
      if (values == undefined) values = {};

      var elem = document.createElement(type);

      elem.innerHTML = new EJS({text: template }).render(values);

      return elem;

    },

    extractLanguages: function(descData) {
      var langs = [];

      for (var field in descData)
        for (var fieldLang in descData[field]) 
          if (!contains(langs, fieldLang)) langs.push(fieldLang);

      return langs;
    }

  };

  init();

};