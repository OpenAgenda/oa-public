'use strict';

module.exports = function walkProtoChain(obj, walker = Object.getOwnPropertyNames) {
  const proto = Object.getPrototypeOf(obj);
  const inherited = proto !== Object.prototype ? walkProtoChain(proto, walker) : [];

  return [...new Set(walker(obj).concat(inherited))];
};
