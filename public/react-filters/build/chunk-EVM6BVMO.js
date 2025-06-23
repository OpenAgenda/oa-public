var __defProp = Object.defineProperty;
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn) return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

export {
  __glob,
  __export
};
//# sourceMappingURL=chunk-EVM6BVMO.js.map