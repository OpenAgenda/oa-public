var handleContextMenu = function(triggerElement, contextMenuElement, eventHandler, params){

  var contextDisplayed = false,
    menuClicked = false,
    triggerClicked = false,
    params = extend({
      position: true, // position context element with script (no css prepositioned)
      left: true, // position context element on left. if not, its on right.
      bodyClickEvent: 'bodyclick'
    }, params),
    init = function(){

    _arrangeStyles();

    if (!eventHandler.hasEvent(params.bodyClickEvent)) addEvent(document.getElementsByTagName('body')[0], 'click', function(){
      eventHandler.trigger(params.bodyClickEvent);
    });

      // if body is clicked, need to check if this elem should be shown or hidden

    eventHandler.on(params.bodyClickEvent, function(){

      if (triggerClicked) {
        contextDisplayed?_hideMenu():_displayMenu();
      } else if (!menuClicked) {
        _hideMenu();
      };

      menuClicked = false;
      triggerClicked = false;

    });

    addEvent(triggerElement, 'click', function(){ triggerClicked = true; });

    addEvent(contextMenuElement, 'click', function(){ menuClicked = true; });

  },
  _hideMenu = function() {

    contextMenuElement.style.display = 'none';
    contextDisplayed = false;

  },
  _displayMenu = function() {

    contextMenuElement.style.display = 'inline-block';
    contextDisplayed = true;

  },
  _arrangeStyles = function(){

    if (!params.position) return;

    if (!triggerElement.parentNode.style.position.length) triggerElement.parentNode.style.position = 'relative';

    var newStyle = { display: 'none', position: 'absolute', zIndex: '2', top: triggerElement.offsetHeight?triggerElement.offsetHeight + 'px':'1em' };

    newStyle[params.left?'left':'right'] = '0px';

    extend(contextMenuElement.style, newStyle);

  };

  init();

};