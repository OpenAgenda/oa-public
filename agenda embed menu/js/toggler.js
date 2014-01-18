if (typeof toggler !== 'undefined') { console.log('toggler is already defined'); } else (function(){
  
  var toggler = function(selElem, menuElem, options) {
    
    var options = extend({
      classes: {
        displayNone: 'display-none'
      },
      attributes: {
        target: 'data-target',
        content: 'data-content'
      },
      canvas: false // when is set, content should be displayed there
    }, options)

    , init = function() {

      addEvent(selElem, 'change', function(e) {

        preventDefault(e);

        _displaySelection(selElem.options[selElem.selectedIndex].getAttribute(options.attributes.target));

        if (options.canvas) _moveContent();

      });

    }

    , _displaySelection = function(targetName) {

      var i=0, contentElem;

      while (contentElem = childObject(menuElem, i++)) {
        if (contentElem.getAttribute(options.attributes.content)==targetName) {
          removeClass(contentElem, options.classes.displayNone);
        } else {
          addClass(contentElem, options.classes.displayNone);
        }
      }

      if (hasClass(menuElem, options.classes.displayNone)) removeClass(menuElem, options.classes.displayNone);

    }

    , _moveContent = function() {

      options.canvas.appendChild(menuElem);

    };

    init();

  };

  window.toggler = toggler;

})();