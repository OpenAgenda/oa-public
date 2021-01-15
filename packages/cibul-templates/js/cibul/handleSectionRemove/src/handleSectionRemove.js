var repeatingSectionsRemove = function(lElem, sectionClass, eventHandler, triggerEvent, removedCallback) {

  if (typeof triggerEvent == 'undefined') triggerEvent = 'scanList';

  eventHandler.on(triggerEvent, function() {

    var hadToDoIt = false, // we had to take it out, no choice, honestly

    sectionElems = getElementsByClassName(lElem, sectionClass),

    i = sectionElems.length-1;

    if (i>0) while(i--)
      if (sectionElems[i+1].innerHTML == sectionElems[i].innerHTML) {
        lElem.removeChild(sectionElems[i+1]);
        hadToDoIt = true;
      }

    if (hadToDoIt && (typeof removedCallback !== 'undefined')) removedCallback();

  });

};