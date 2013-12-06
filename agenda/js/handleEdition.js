var extractCurrentEditors = function(editors, item) {
  
  if (!editors[item.article.a]) 
    editors[item.article.a] = 0;

  editors[item.article.a]++;

};

var addEditionBehavior = function(editors, params) {

  params = extend({
    isOwner: false,
    isMain: false,
    user: false,
    canvas: '<span>edit</span><ul class="wsq"></ul>',
    actionCallback: function(name, id, elem) { console.log(name); console.log(id); },
    edit: { template: '<! -- editprogram -->', action: '#editprogram', appendTo: false, enabled: true },
    disabledClass: 'disabled'
  }, params);

  var menusDisabled = false,

  eventHandler = sEventHandler.getInstance(),

  init = function() {

    // this bit is for the program edit link
    if (params.isOwner) {

      var canvas = document.createElement('div');
      canvas.innerHTML = params.edit.template;
      el(canvas, 'a').href = params.edit.action;
      params.edit.appendTo.appendChild(canvas.childNodes[0]);

    }

  };

  init();

};