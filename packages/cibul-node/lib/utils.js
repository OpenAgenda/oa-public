'use strict';

module.exports = {
  extend,
  filterByAttr,
  isArray,
  size,
  fZ,
  unique,
  forEach, // for some older browsers
};

function unique(arr) {
  const u = [];

  arr.forEach(a => {
    if (u.indexOf(a) === -1) u.push(a);
  });

  return u;
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function size(obj) {
  let size = 0; let
    key;

  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }

  return size;
}

function filterByAttr(obj, arr) {
  const newObj = {};

  forEach(arr, name => {
    if (obj[name] !== undefined) newObj[name] = obj[name];
  });

  return newObj;
}

function forEach(array, action) {
  for (let i = 0; i < array.length; i++) {
    action(array[i]);
  }
}

function extend() {
  for (let i = 1; i < arguments.length; i++) {
    for (const key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }

  return arguments[0];
}

function fZ(n, size) {
  if (!size) size = 2;

  let s = `${n}`;

  while (s.length < size) s = `0${s}`;

  return s;
}
