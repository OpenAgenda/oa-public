var maps = (function(){

  var types = {}
    , ROADMAP = 'roadmap'
    , libs = {};

  var init = function(type, libOptions) {

    if (!libs[type]) throw 'map type unknown';

    var lib = libs[type];

    if (lib.init) lib.init(libOptions);

    return lib;

  };

  return {
    use: function(type, options) {

      if (!types[type]) types[type] = init(type, options);

      return types[type];
    },
    register: function(type, lib) {

      libs[type] = lib;

    }
  }

})();