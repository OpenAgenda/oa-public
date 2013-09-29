function handleProgramControlData(iterationFunctions, callback, controlData) {

  var forEachLocationOfEachArticle = function(data, callback) {
    for (aIndex in data) {
      for (lIndex in data[aIndex].l) {
        callback({articleId: aIndex, article: data[aIndex], locationSlug: lIndex, location: data[aIndex].l[lIndex]});
      }
    }
  };

  var run = function(controlData) {

    callbackData = [];

    forEach(iterationFunctions, function(){
      callbackData.push({});
    });

    forEachLocationOfEachArticle(controlData.a, function(iterationItem){

      var i = iterationFunctions.length;

      while (i--) 
        iterationFunctions[i](callbackData[i], iterationItem);

    });

    callback(controlData, callbackData);

  };

  if (typeof controlData != 'string') {
    return run(controlData);
  }
  else {
    remote.getJsonp(controlData, {data: {format: 'jsonp', getcontroldata: ''} }, function(responseType, data){
      run(data);
    });  
  }

};