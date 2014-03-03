var handleDisplayButton = function (button, elems, options) {

  if (isElement(elems)) elems = [elems];

  var params = extend({
    event: 'buttontapped',
    classes: {
      active: 'active',
      displayNone: 'display-none'
    }
  }, options),

  eh = sEventHandler.getInstance(),

  run = function() {

    if (typeof button == 'string') {

      var buttonWrap = document.createElement('div');

      buttonWrap.innerHTML = button;

      button = childObject(buttonWrap, 0);

      button.clickEvent = params.event;

      addEvent(button, 'click', function() {

        eh.trigger(button.clickEvent, button);

      });

    }

    eh.on(button.clickEvent, function(tappedButton) {

      if ((tappedButton == button) && (hasClass(elems[0], params.classes.displayNone))) {

        _show();

      } else {

        _hide();

      }

    });

    _hide();

    return button;

  },

  _hide = function() {

    for (var i = elems.length - 1; i >= 0; i--) {
      addClass(elems[i], params.classes.displayNone);
    }

    removeClass(button, params.classes.active);

  },

  _show = function() {

    addClass(button, params.classes.active);

    for (var i = elems.length - 1; i >= 0; i--) {
      removeClass(elems[i], params.classes.displayNone);
    }

  };

  return run();

};