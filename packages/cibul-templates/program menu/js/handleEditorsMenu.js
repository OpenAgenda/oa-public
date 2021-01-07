var initEditorsMenu = function(options) {

  var run = function() {

    var template = new EJS({text: options.templates.editor})
      , editorUids = [];

    forEach(options.editors, function(editor) {
      var editorElem = _makeEditorElem(template, editor);

      options.elems.editors.appendChild(editorElem);

      editorUids.push(parseInt(editor.uid, 10));
    });

    if (contains(editorUids, options.loggedUid)) _setInviteBehavior(function(editor) {

      var editorElem = _makeEditorElem(template, editor);

      options.elems.editors.insertAdjacentElement('afterbegin', editorElem);
    });

  },
  _makeEditorElem = function(template, editor) {

    var div = document.createElement('div');
    div.innerHTML = template.render(editor);

    if (options.loggedUid==options.ownerUid && (options.ownerUid !== parseInt(editor.uid, 10))) {
      var removeLink = document.createElement('li');
      removeLink.innerHTML = '<a><i class="icon-remove"></i></a>';
      addEvent(removeLink, 'click', function() {
        _sendRemoveEditorRequest(editor.uid, div, removeLink);
      });
      getElementsByClassName(div, options.classes.editorAction)[0].appendChild(removeLink);
    }

    return div;

  },
  _setInviteBehavior = function(onNewEditor) {

    var selectedUid = false
      , email = false
      , locked = false
      ;

    options.elems.invite.removeAttribute('disabled');

    // there is a submit button. when pressed, send content of input and uid of associated review if any.
    addEvent(options.elems.submit, 'click', function(){

      if (email && (email.split("@").length > 2)) return _lightbox(options.labels.unique);

      var data = selectedUid?{uid: selectedUid}:(email?{email: email}:false);

      if (data && !locked) {

        locked = true;

        sendGetMessage({
          url: options.resources.newEditor,
          data: data,
          button: options.elems.submit,
          complete: function() {
            locked = false;
          },
          success: function(data) {
            // if its a success and there is a new editor, display him

            if (data.editor) onNewEditor(data.editor);

            options.elems.invite.value = '';
          },
          timeout: options.timeout
        });
      }

    });

    // write suggestions
    handleSuggestions(options.elems.invite, options.related, 'title', '<% if (image) { %><img src="<%= image %>" class="pic-nano"/><% } %><span><%=title%></span>', {
      contextMenuClass: 'wsq',
      onSelect: function(selected) {
        selectedUid = selected.uid;
      },
      onChange: function(value) {
        selectedUid = false;

        if (value.indexOf('@')!=-1)
          email = value;
        else
          email = false;
      }
    });

  },

  _sendRemoveEditorRequest = function(uid, editorElem, removeLink) {

    sendGetMessage({
      url: options.resources.removeEditor.replace('uid', uid),
      button: removeLink,
      success: function(data) {
        editorElem.parentNode.removeChild(editorElem);
      },
      timeout: options.timeout
    });

  },

  _lightbox = function(message) {
    lightbox({
      message: message,
      classes: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons', button: 'small button'}
    });
  };

  run();

};