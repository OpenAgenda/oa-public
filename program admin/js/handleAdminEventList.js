var handleAdminEventList = function(params) {

  params = extend({
    selectors: {
      listItem: '.js_event_item',
      ajaxLink: '.js_ajax'
    },
    ajax: true,
    spinner: {
      lines: 7, // The number of lines to draw
      length: 3, // The length of each line
      width: 2, // The line thickness
      radius: 3, // The radius of the inner circle
      corners: 0, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 22, // Afterglow percentage
      className: 'button-spinner', // The CSS class to assign to the spinner
    },
    classes: {
      lightboxFrame: 'wsq lightbox-frame',
      lightboxCanvas: 'lightbox-canvas',
      lightboxButtonBox: 'lightbox-buttons'
    }
  }, params);

  var spinner,

  _run = function() {

    forEach(els(params.selectors.listItem), _applyItemBehavior);

  },

  _getSerializedFormResource = function(submitElem) {

    var values = {}
      , formElem = submitElem.parentNode;

    forEach(['select', 'input', 'textarea'], function(fieldType) {
      forEach(els(formElem, fieldType), function(elem) {
        values[elem.name] = elem.value;
      });
    });

    return formElem.getAttribute('action').addUrlParameters(values);
  },

  _applyItemBehavior = function(item) {

    forEach(els(item, params.selectors.ajaxLink), function(linkItem) {

      addEvent(linkItem, 'click', function(e) {

        _spin(linkItem);

        preventDefault(e);

        var resource = (linkItem.tagName!=='A')?_getSerializedFormResource(linkItem):linkItem.getAttribute('href');

        remote.get(resource, { timeout: 5000 }, function(type, data) {

          _unspin(linkItem);

          if (type=='success' && data.partial) {

            _applyItemBehavior(_replaceItem(item, data.partial));

          } else {

            if (data.message) lightbox({
              message: data.message,
              classes: { frame: params.classes.lightboxFrame, canvas: params.classes.lightboxCanvas, buttonBox: params.classes.lightboxButtonBox }
            });

          };

        }, params.ajax);

      });

    });

  },

  _replaceItem = function(item, partial) {

    item.style.display = 'none';

    item.insertAdjacentHTML('afterend', partial);

    var newItem = nextObject(item);

    item.parentNode.removeChild(item);

    return newItem;

  },

  _spin = function(elem) {

    if (spinner) return;

    spinner = new Spinner(params.spinner);

    spinner.spin();

    elem.insertAdjacentElement('afterend', spinner.el);

  },

  _unspin = function() {

    if (!spinner) return;

    spinner.stop();

    spinner = undefined;

  };
 
  _run();

};