/**
 * runs the widget method for the matching selector as soon as the page is ready
 */
if (typeof cibulWidgetInit == 'undefined') var cibulWidgetInit = function(selector, callback, controller) {

  var run = function() {

    forEach(els(selector), function(elem) {

      if(elem.hasAttribute('data-flagged')) return;

      callback(elem, controller);
      
      elem.setAttribute('data-flagged', '');

    });
  };

  if (document.readyState === "complete")
    run();
  else
    addEvent(window, 'load', run);

};