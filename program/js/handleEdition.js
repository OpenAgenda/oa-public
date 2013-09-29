var extractCurrentEditors = function(editors, item) {
  
  if (!editors[item.article.a]) 
    editors[item.article.a] = 0;

  editors[item.article.a]++;

};

var addEditionBehavior = function(listCanvasElem, listElementClass, editors, eventHandler, params) {

  params = extend({
    triggerEvents: { refresh: 'refresh' },
    isOwner: false,
    isMain: false,
    user: false,
    canvas: '<span>edit</span><ul class="wsq"></ul>',
    templates: { remove: '<!-- remove -->', edit: '<!-- edit -->', category: '<!-- category -->', tag: '<!-- tag -->'},
    actionCallback: function(name, id, elem) { console.log(name); console.log(id); },
    edit: { template: '<! -- editprogram -->', action: '#editprogram', appendTo: false, enabled: true},
    admin: { template: '<! -- adminprogram -->', action: '#adminprogram', appendTo: false, enabled: false},
    disabledClass: 'disabled',
    labels: false
  }, params);

  params.editors = extend({ template: '<a href="<%= link %>"><i class="icon-group"></i><span><%= labels.editors %></span></a>', link: '#editors', appendTo: false, }, params.editors?params.editors:{});

  var menusDisabled = false,
    init = function() {

    // this bit is for the program edit link
    if (params.isOwner) {
      forEach(['edit', 'admin'], function(oLink) {

        if (params[oLink].enabled) {
          var link = document.createElement('li');
          link.innerHTML = params[oLink].template;
          el(link, 'a').href = params[oLink].action;
          params[oLink].appendTo.appendChild(link);
        }
        
      });
    }

    // this bit is for the editors link. show it when editors are multiple or when program is not main

    if (Object.size(editors)>1 || !params.isMain) {
      var editorsLink = document.createElement('li');
      editorsLink.innerHTML = new EJS({text: params.editors.template }).render({link: params.editors.link, labels: params.labels });
      params.editors.appendTo.appendChild(editorsLink);
    }

    // this bit is for the article actions
    if (params.user) if (typeof editors[params.user] != 'undefined' || params.isOwner) eventHandler.on(params.triggerEvents.refresh, function() {

      _trasverseList();

    });

    _trasverseList();

  },
  _trasverseList = function() {

    forEach(getElementsByClassName(listCanvasElem, listElementClass), function(aElem) {

      var author = aElem.getAttribute('data-author'),
        id = aElem.getAttribute('data-id');

      if (!author) return;
      
      if (!params.isOwner && author != params.user) return;

      // edit menu

      var editCanvasElem = _createEditCanvas();

      for (action in params.templates) {
        editCanvasElem.getElementsByTagName('ul')[0].appendChild(_createActionElem(action, id, aElem));
      }

      aElem.getElementsByTagName('ul')[0].appendChild(editCanvasElem);
      
      aElem.removeAttribute('data-author');
      aElem.removeAttribute('data-id');

    });
  },
  _createEditCanvas = function() {
    var editCanvas = document.createElement('li');
    editCanvas.innerHTML = params.canvas;
    editCanvas.getElementsByTagName('ul')[0].style.display = 'none';
    handleContextMenu(editCanvas.getElementsByTagName('span')[0], editCanvas.getElementsByTagName('ul')[0], eventHandler);
    return editCanvas;
  },
  _createActionElem = function(name, id, elem) {
    var action = document.createElement('li');
    action.innerHTML = params.templates[name];
    addEvent(action, 'click', function(e) {

      if (menusDisabled) return;

      preventDefault(e);
      _freezeMenu(action);
      params.actionCallback(name, id, elem);
    });
    return action;
  },
  _freezeMenu = function(action) {
    addClass(action.parentNode, params.disabledClass);
    menusDisabled = true;

    setTimeout(function(){
      removeClass(action.parentNode, params.disabledClass);
      menusDisabled = false;
    }, 2000);
  };

  init();

};