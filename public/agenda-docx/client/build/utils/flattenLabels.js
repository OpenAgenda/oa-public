import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
export default (labels, lang) => {
  var _context;
  return _reduceInstanceProperty(_context = Object.keys(labels)).call(_context, (flat, key) => {
    flat[key] = labels[key][lang];
    return flat;
  }, {});
};
//# sourceMappingURL=flattenLabels.js.map