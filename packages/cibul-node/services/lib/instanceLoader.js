'use strict';

module.exports = function (extension) {
  return function (loadedInstance, instance, methods) {
    const ext = extension(loadedInstance, instance);

    methods.forEach(m => {
      const namespace = _loadNamespace(loadedInstance, m);

      const name = _loadName(m);

      namespace[name] = ext[name];
    });
  };

  function _loadNamespace(loadedInstance, m) {
    const names = m.split('.');

    if (names.length == 1) {
      return loadedInstance;
    }

    if (!loadedInstance[names[0]]) {
      loadedInstance[names[0]] = {};
    }

    return loadedInstance[names[0]];
  }

  function _loadName(name) {
    return name.split('.').pop();
  }
};
