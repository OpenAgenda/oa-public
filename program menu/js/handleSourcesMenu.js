var handleSourcesMenu = function(params) {

  var run = function() {

    var template = new EJS({text: params.templates.source});

    forEach(params.sources, function(source) {
      var sourceElem = _makeSourceElem(template, source);

      params.elems.sources.appendChild(sourceElem);

    });

  },
  _makeSourceElem = function(template, source) {

    var div = document.createElement('div');
    div.innerHTML = template.render(source);

    if (params.loggedUid==params.ownerUid) {
      var removeLink = document.createElement('li');
      removeLink.innerHTML = '<a><i class="icon-remove"></i></a>';
      addEvent(removeLink, 'click', function() {
        _sendRemoveSourceRequest(source.uid, div, removeLink);
      });
      getElementsByClassName(div, params.classes.sourceAction)[0].appendChild(removeLink);
    }

    return div;

  },
  _sendRemoveSourceRequest = function(uid, div, removeLink) {

    sendGetMessage({
      url: params.removeSource.replace('sUid', uid),
      button: removeLink,
      success: function(data) {
        div.parentNode.removeChild(div);
      }
    });

  };

  run();

};