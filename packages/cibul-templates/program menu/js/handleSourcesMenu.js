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

    var removeLink = document.createElement('li');
    removeLink.innerHTML = '<a><i class="fa fa-remove"></i></a>';
    addEvent(removeLink, 'click', function() {
      _sendRemoveSourceRequest(source.uid, div, removeLink);
    });

    div.insertAdjacentHTML( 'afterbegin', '<div class="rwi-act" style="float: right; padding-right: 1em;"></div>')

    getElementsByClassName(div, params.classes.sourceAction)[0].appendChild(removeLink);
    

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