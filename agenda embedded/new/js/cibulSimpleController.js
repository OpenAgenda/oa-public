if (typeof cibulControllers == 'undefined') (function() {

  var enable, include, ctl, controlData,

  update = function(values) {

    setTimeout(function() {
      enable(values);
    }, 100);
    
  },

  randomInclude = function() {

    for (var i in controlData.a) {
      if (Math.random()>0.8) {
        include(controlData.a[i]);
      }
    }

  },

  getControlData = function(callback) {

    if (typeof cibulEnv !== 'undefined') remote.getJsonp(cibulEnv.paths.ctl.replace('{uid}', cibulEnv.uid), {data: {key: cibulEnv.key}}, function(success, data) {

      controlData = data.data;

      callback(controlData);

      randomInclude();

      enable();

    });

    else {

      controlData = window.controlData;

      callback(controlData);

      randomInclude();

      enable();

    }

  },

  register = function(name, params) {

    enable = params.enable;
    include = params.include;

    return {
        update: update,
        getControlData: getControlData
    };

  },

  loadWidget = function(selector, callback) {

    var run = function() {

      if (el(selector) === null) return;

      callback(el(selector), register);

    };

    if (document.readyState === "complete")
      run();
    else
      addEvent(window, 'load', run);

  };


  window.cibulControllers = {
    register: register,
    loadWidget: loadWidget
  };

})();