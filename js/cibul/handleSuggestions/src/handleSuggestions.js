var handleSuggestions = function(inputElem, list, key, template, options) {

  var contextMenu, contextDiv, possibles = [],

  run = function() {

    options = extend({
      contextMenuClass: false,
      onSelect: false,
      onChange: false
    }, options);

    contextDiv = document.createElement('div');    

    // create context menu element
    contextDiv.style.display = 'none';
    if (options.contextMenuClass) addClass(contextDiv, options.contextMenuClass);
    inputElem.insertAdjacentElement('afterend', contextDiv);

    // give behavior to context menu element
    contextMenu = handleContextMenu(inputElem, contextDiv, sEventHandler.getInstance(), {openOnClick: false});

    // provide and show shortlist based on input value
    addEvent(inputElem, 'keyup', function(e){

      if (e.keyCode==13) if (possibles.length) return _select(possibles[0]);

      if (options.onChange) options.onChange(inputElem.value);

      possibles = _shortlist(inputElem.value, list, key);

      if (possibles.length == 0 || possibles.length > 10) {
        contextMenu.hide();
        return;
      }
      
      _writeSuggestions(contextDiv, possibles, template, _select);

      contextMenu.show();

    });

  },

  _writeSuggestions = function(canvasElem, list, template, onClick) {

    while (canvasElem.hasChildNodes()) canvasElem.removeChild(canvasElem.childNodes[0]);

    var ejs = new EJS({text: template}), newChild, ul = document.createElement('ul'), li;

    forEach(list, function(listItem) {

      li = document.createElement('li');

      li.innerHTML = ejs.render(listItem);

      addEvent(li, 'click', function() {
        onClick(listItem);
      });

      ul.appendChild(li);

    });

    canvasElem.appendChild(ul);

  },

  _shortlist = function(value, list, key){

    var regex = ''
      , selection = [];

    forEach (value, function(c) {
      regex += '.*' + c.toLowerCase();
    });

    regex = new RegExp(regex);

    forEach(list, function(listItem) {
      if (listItem[key].toLowerCase().match(regex)) selection.push(listItem);
    });

    return selection;

  },

  _select = function(selectedItem) {
    inputElem.value = selectedItem[key].replace('&#039;', '\'');
    contextMenu.hide();
    if (options.onSelect) options.onSelect(selectedItem);
  },

  _remove = function() {

    if (contextDiv) contextDiv.parentNode.removeChild(contextDiv);

  }

  run();

  return {
    remove: _remove
  }

};