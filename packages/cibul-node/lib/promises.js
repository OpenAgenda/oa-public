const w = require('when');

const wn = require('when/node');

module.exports = {
  w,
  wn,
  interrupt,
  ife: ifEqual(_isEqual),
  ifl: ifEqual(_isLoaded),
};

function ifEqual(compareFunc) {
  return function (requirements, func) {
    return function (values) {
      let matches = true;

      for (const r in requirements) {
        if (!compareFunc(r, requirements[r], values)) {
          matches = false;

          break;
        }
      }

      if (matches) return func(values);

      return values;
    };
  };
}

function _isEqual(key, requiredValue, values) {
  const compared = _retrieveValue(key, values);

  return compared === requiredValue;
}

function _isLoaded(key, requiredValue, values) {
  const compared = _retrieveValue(key, values);

  return !!compared === !!requiredValue;
}

function _retrieveValue(key, values) {
  let compared = values;

  const keyParts = key.split('.');

  let empty = false;

  keyParts.forEach(keyPart => {
    if (empty) return;

    if (compared[keyPart] === undefined) {
      empty = true;
    } else {
      compared = compared[keyPart];
    }
  });

  if (empty) return;

  return compared;
}

function interrupt(message) {
  return function () {
    throw message;
  };
}
