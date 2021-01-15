var handleAdminEventList = function(params) {

  params = extend({
    selectors: {
      listItem: '.js_event_item',
      ajaxLink: '.js_ajax',
      publishLink: '.js_publish',
      actions: '.js_actions',
      organizeLink: '.js_organize_link',
      organize: '.js_organize',
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
    flags: {
      organizeShow: 'data-show'
    },
    classes: {
      lightboxFrame: 'wsq lightbox-frame',
      lightboxCanvas: 'lightbox-canvas',
      lightboxButtonBox: 'lightbox-buttons',
      displayNone: 'display-none',
      selected: 'selected'
    }
  }, params);

  var spinner,

  _run = function() {

    forEach(els(params.selectors.listItem), _applyItemBehavior);

  },

  _getSerializedFormResource = function(submitElem) {

    var values = {},
    
    formElem = submitElem.parentNode;

    forEach(['select', 'input', 'textarea'], function(fieldType) {
      forEach(els(formElem, fieldType), function(elem) {
        values[elem.name] = elem.value;
      });
    });

    return formElem.getAttribute('action').addUrlParameters(values);
  },

  _applyItemBehavior = function(item) {

    _enableAjaxActions(item);

    // this is for the organize link
    
    if (item.hasAttribute(params.flags.organizeShow)) return;

    // display organize link, hide tags and categories sub menus
    
    if ( !el(item, params.selectors.organize) ) return;
    if ( !el(item, params.selectors.organizeLink) ) return;

    addClass(el(item, params.selectors.organize), params.classes.displayNone);
    removeClass(el(item, params.selectors.organizeLink), params.classes.displayNone);

    addEvent(el(item, params.selectors.organizeLink), 'click', function(e) {
      
      preventDefault(e);

      if (hasClass(el(item, params.selectors.organizeLink), params.classes.selected)) return;

      removeClass(el(item, params.selectors.organize), params.classes.displayNone);

      addClass(el(item, params.selectors.organizeLink), params.classes.selected);

    });

  },

  // enable sending ajax requests
  _enableAjaxActions = function(item) {

    forEach(els(item, params.selectors.ajaxLink), function(linkItem) {

      if (linkItem.tagName=='A') {
        _addOnClickBehavior(item, linkItem);
      } else {
        _addOnChangeBehavior(item, linkItem);
      }

    });

    forEach( els( item, params.selectors.publishLink ), function( linkItem ) {

      addEvent( linkItem, 'click', function( e ) {

        preventDefault( e );

        _processRequest( item, linkItem, linkItem.getAttribute( 'href' ), function( err, responseType, data ) {

          if ( responseType !== 'success' || !data.success ) return;

          if ( linkItem.getAttribute( 'data-state' ) == 1 ) {

            linkItem.innerHTML = linkItem.getAttribute( 'data-unpublish-label' );

            linkItem.setAttribute( 'href', linkItem.getAttribute( 'data-unpublish-route' ) );

            linkItem.setAttribute( 'data-state', 2 );

          } else {

            linkItem.innerHTML = linkItem.getAttribute( 'data-publish-label');

            linkItem.setAttribute( 'href', linkItem.getAttribute( 'data-publish-route' ) );

            linkItem.setAttribute( 'data-state', 1 );

          }

        });

      })

    });

  },

  // when the link is clicked, send the request
  _addOnClickBehavior = function(item, linkItem) {

    addEvent(linkItem, 'click', function(e) {

      preventDefault(e);

      _processRequest(item, linkItem, linkItem.getAttribute('href'));

    });

  },

  // when one of the inputs of the item's form changes, request is sent
  _addOnChangeBehavior = function(item, linkItem) {

    addClass(linkItem, params.classes.displayNone);

    _monitorChange(linkItem, function() {
      _processRequest(item, linkItem, _getSerializedFormResource(linkItem));
    });

  },

  // monitor change on all input elements within form
  // select, input
  _monitorChange = function(linkItem, callback) {

    forEach(els(linkItem.parentNode, 'select'), function(selectItem) {
      addEvent(selectItem, 'change', callback);
    });

  },

  // process request and response
  _processRequest = function( item, linkItem, resource, cb ) {

    _spin(linkItem);

    remote.get(resource, { timeout: 5000 }, function(type, data) {

      _unspin(linkItem);

      if (type=='success' && data.partial) {

        _applyItemBehavior(_replaceItem(item, data.partial));

      } else if ( data.message ) {

        lightbox({
          message: data.message,
          classes: { frame: params.classes.lightboxFrame, canvas: params.classes.lightboxCanvas, buttonBox: params.classes.lightboxButtonBox }
        });

      } else if ( cb ) {

        cb( null, type, data );

      }
      
    } , params.ajax);

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