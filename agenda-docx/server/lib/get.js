'use strict';

/* eslint-disable */

const _ = require('lodash');

/** Used as the maximum memoize cache size. */
const MAX_MEMOIZE_SIZE = 500;

/** Used to match backslashes in property paths. */
const reEscapeChar = /\\(\\)?/g;

/** Used to match property names within property paths. */
const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

const { isArray } = Array;

const isNumberLike = value =>
  !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
const stringToPath = memoizeCapped(string => {
  const result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, (match, number, quote, subString) => {
    result.push(
      quote ? subString.replace(reEscapeChar, '$1') : number || match
    );
  });
  return result;
});

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  const result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  const { length } = path;
  let index = 0;

  while (object != null && index < length) {
    const nextPath = path[index++];

    if (nextPath === '' || _.includes(nextPath, '=')) {
      const leftPath = _.slice(path, index);
      let predicate;

      if (nextPath === '') {
        predicate = _.stubTrue;
      } else {
        predicate = _.split(nextPath, '=');
        predicate[1] = JSON.parse(`${predicate[1]}`);
      }

      const result = _.reduce(
        _.filter(object, predicate),
        (result, nextObject) => {
          if (isNumberLike(leftPath[0])) {
            return baseGet(nextObject, leftPath.slice(1));
          }

          return _.concat(
            result,
            index && index == length
              ? nextObject
              : baseGet(nextObject, leftPath)
          );
        },
        []
      );

      return result;
    }
    object = object[toKey(nextPath)];
  }

  return index && index == length ? object : undefined;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(_.toString(value));
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (_.isArray(value)) {
    return false;
  }
  const type = typeof value;
  if (
    type == 'number' ||
    type == 'symbol' ||
    type == 'boolean' ||
    value == null ||
    _.isSymbol(value)
  ) {
    return true;
  }
  return (
    reIsPlainProp.test(value) ||
    !reIsDeepProp.test(value) ||
    (object != null && value in Object(object))
  );
}

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value === 'string' || _.isSymbol(value)) {
    return value;
  }
  const result = `${value}`;
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  const result = _.memoize(func, key => {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  const { cache } = result;
  return result;
}

module.exports = get;
