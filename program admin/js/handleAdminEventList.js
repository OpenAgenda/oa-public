var handleAdminEventList = function(params) {

  params = extend({
    selectors: {
      listItem: '.js_event_item',
      ajaxLink: '.js_ajax'
    },
    ajax: true
  }, params);

  var _run = function() {

    forEach(els(params.selectors.listItem), _applyItemBehavior);

  },

  _applyItemBehavior = function(item) {

    forEach(els(item, params.selectors.ajaxLink), function(linkItem) {

      addEvent(linkItem, 'click', function(e) {

        preventDefault(e);

        remote.get(linkItem.getAttribute('href'), { timeout: 5000 }, function(type, data) {

          if (type=='success' && data.partial) {

            _applyItemBehavior(_replaceItem(item, data.partial));

          } else {
            console.log('problem');
          };

        }, params.ajax);

      });

    });

  },

  // replace item passed in parameters with new item as described in partial

  _replaceItem = function(item, partial) {

    item.style.display = 'none';

    item.insertAdjacentHTML('afterend', partial);

    var newItem = nextObject(item);

    item.parentNode.removeChild(item);

    return newItem;

  };
 
  _run();

};