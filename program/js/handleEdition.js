var extractCurrentEditors = function(editors, item) {
  
  if (!editors[item.article.a]) 
    editors[item.article.a] = 0;

  editors[item.article.a]++;

};

var addEditionBehavior = function(listCanvasElem, listElementClass, editors, params) {

  params = extend({
    triggerEvents: { refresh: 'refresh' },
    isOwner: false,
    isMain: false,
    user: false,
    canvas: '<span>edit</span><ul class="wsq"></ul>',
    actionCallback: function(name, id, elem) { console.log(name); console.log(id); },
    edit: { template: '<! -- editprogram -->', action: '#editprogram', appendTo: false, enabled: true},
    admin: { template: '<! -- adminprogram -->', action: '#adminprogram', appendTo: false, enabled: false},
    disabledClass: 'disabled',
    labels: false
  }, params);

  params.editors = extend({ template: '<a href="<%= link %>"><i class="icon-group"></i><span><%= labels.editors %></span></a>', link: '#editors', appendTo: false, }, params.editors?params.editors:{});

  var menusDisabled = false,

    eventHandler = sEventHandler.getInstance(),

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

  };

  init();

};