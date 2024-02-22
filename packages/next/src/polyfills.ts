if (!Object.hasOwn) {
  Object.hasOwn = function hasOwn(object, property) {
    if (object == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object.prototype.hasOwnProperty.call(Object(object), property);
  };
}

export {};
