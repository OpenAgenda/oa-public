var handleContextMenu = function(triggerElement, contextMenuElement, eventHandler, params){

  var contextDisplayed = false,
    menuClicked = false,
    triggerClicked = false,
    params = extend({
      position: true, // position context element with script (no css prepositioned)
      left: true, // position context element on left. if not, its on right.
      bodyClickEvent: 'bodyclick',
      openOnClick: true,
      zIndex: 2
    }, params),
    init = function(){

    _initStyles();

    if (!eventHandler.hasEvent(params.bodyClickEvent)) addEvent(el('body'), 'click', function(){
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

    if (params.openOnClick) addEvent(triggerElement, 'click', function(){ triggerClicked = true; });

    addEvent(contextMenuElement, 'click', function(){ menuClicked = true; });

  },
  _hideMenu = function() {

    contextMenuElement.style.display = 'none';
    contextDisplayed = false;

  },
  _displayMenu = function() {

    contextMenuElement.style.display = 'inline-block';
    _displayStyle();
    contextDisplayed = true;

  },
  _initStyles = function(){

    if (!params.position) return;

    if (!triggerElement.parentNode.style.position.length) triggerElement.parentNode.style.position = 'relative';

    extend(contextMenuElement.style, {
      display: 'none',
      position: 'absolute',
      zIndex: params.zIndex
    });

  },
  _displayStyle = function() {

    extend(contextMenuElement.style, {
      display: 'inline-block',
      top: triggerElement.offsetHeight?triggerElement.offsetHeight + 'px':'1em'
    });

    var offsetPos = triggerElement[params.left?'offsetLeft':'offsetRight']?triggerElement[params.left?'offsetLeft':'offsetRight']:'0';

    contextMenuElement.style[params.left?'left':'right'] = offsetPos + 'px';
  };

  init();

  return {
    show: _displayMenu,
    hide: _hideMenu
  };

}