var makeEventHeightGetter = function(eventElem, heightChangeEvent) {

  var height = false
    , callback = false;

  sEventHandler.getInstance().on(heightChangeEvent, function() {
    
    height = eventElem.offsetHeight;

    if (callback) callback(height);

  });

  return function(cb) {

    callback = cb;

    if (height) callback(height);
  
  };

}