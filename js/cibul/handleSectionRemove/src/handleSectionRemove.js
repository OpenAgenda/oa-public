var repeatingSectionsRemove = function(lElem, sectionClass, eventHandler, triggerEvent) {

  if (typeof triggerEvent == 'undefined') triggerEvent = 'scanList';

  eventHandler.on(triggerEvent, function() {

    var sectionElems = getElementsByClassName(lElem, sectionClass),
      i = sectionElems.length-1;

    if (i>0) while(i--)
      if (sectionElems[i+1].innerHTML == sectionElems[i].innerHTML) lElem.removeChild(sectionElems[i+1]);

  });

}