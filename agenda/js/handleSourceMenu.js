var handleSourceMenu = function(params) {

  params = extend({
    debug: false,
    classes: {},
    label: 'use as source'
  }, params);

  params.classes = extend({ isSource: 'js_is', isNotSource: 'js_is_not', contextMenu: 'wsq context-menu', aggregatorListItem: 'agg'}, params.classes);

  var reqParams = {},

  listItems, // where retrieved aggregator list is stored and updated

  init = function() {

    if (params.debug) reqParams.format = 'jsonp';

    // fetch agg list from remote

    remote.get(params.resources.list, {retries: 0, timeout: 10000, data: reqParams}, function(responseType, data) {

      if (!_checkResponse(responseType, data)) return;

      listItems = data.data;

      _makeDomMenu({
        onAddClick: function(item) {

          _hideIcons(item);

          sendGetMessage({
            url: params.resources.add.replace('aUid', item.p.uid),
            button: item.dom.childNodes[0],
            data: reqParams,
            debug: params.debug,
            success: function(data) {
              if (data.success) item.l = true;
              _updateDisplay(item);
            }
          });

        },
        onRemoveClick: function(item) {

          _hideIcons(item);

          sendGetMessage({
            url: params.resources.remove.replace('aUid', item.p.uid),
            button: item.dom.childNodes[0],
            data: reqParams,
            debug: params.debug,
            success: function(data) {
              item.l = false;
              _updateDisplay(item);
            }
          });
        }
      });

    }, !params.debug);

  },

  _checkResponse = function(responseType, data) {

    if (responseType !== 'success') {
      console.log('aggregator list could not be fetched, request was not successful: ' + responseType);
      return false;
    }

    if (!data.success) {
      console.log('Aggregator: ' + data.message);
      return false;
    }

    return true;

  },

  _makeDomMenu = function(callbacks) {

    var programItemEjs = new EJS({text: params.templates.programItem}),
      aggItemEjs = new EJS({text: params.templates.aggItem}),
      aggLinkEjs = new EJS({text: params.templates.aggLink});

    // create link
    
    var link = document.createElement('li');
    link.innerHTML = aggLinkEjs.render({ label: params.label });

    params.anchor.appendChild(link);

    // create context menu

    var cMenu = document.createElement('div');
    cMenu.className = params.classes.contextMenu;
    cMenu.style.display = 'none';
    cMenu.innerHTML = '<ul></ul>';

    link.appendChild(cMenu);

    handleContextMenu(link.childNodes[0], cMenu, sEventHandler.getInstance(), {zIndex: 3});

    // add aggregator items to context menu

    forEach(listItems, function(listItem) {

      listItem.dom = document.createElement('li');

      listItem.dom.className = params.classes.aggregatorListItem;

      listItem.dom.innerHTML = aggItemEjs.render({programItem: programItemEjs.render(listItem.p) });

      addEvent(listItem.dom, 'click', function(e) {
        preventDefault(e);
        listItem.l?callbacks.onRemoveClick(listItem):callbacks.onAddClick(listItem);
      });

      cMenu.getElementsByTagName('ul')[0].appendChild(listItem.dom);

      _updateDisplay(listItem);

    });

  },

  _hideIcons = function(listItem) {
    getElementsByClassName(listItem.dom, params.classes.isSource)[0].style.display = 'none';
    getElementsByClassName(listItem.dom, params.classes.isNotSource)[0].style.display = 'none';
  },

  _updateDisplay = function(listItem) {
    getElementsByClassName(listItem.dom, params.classes.isSource)[0].style.display = listItem.l?'inline-block':'none';
    getElementsByClassName(listItem.dom, params.classes.isNotSource)[0].style.display = listItem.l?'none':'inline-block';
  };

  init();

};