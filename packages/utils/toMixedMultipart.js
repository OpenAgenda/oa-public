'use strict';

function replacerWithPath(replacer) {
  const m = new Map();

  return function (field, value) {
    const pathname = m.get(this);
    let path;

    if (pathname) {
      const suffix = Array.isArray(this) ? `[${field}]` : `.${field}`;

      path = pathname + suffix;
    } else {
      path = field;
    }

    if (value === Object(value)) {
      m.set(value, path);
    }

    return replacer.call(this, field, value, path);
  }
}

function walkWith(obj, fn, preserveUndefined) {
  const walk = objPart => {
    if (objPart === undefined) {
      return;
    }

    let result;

    // TODO other types than object
    for (const key in objPart) {
      const val = objPart[key];
      let modified;

      if (val === Object(val)) {
        modified = walk(fn.call(objPart, key, val));
      } else {
        modified = fn.call(objPart, key, val);
      }

      if (preserveUndefined || modified !== undefined) {
        if (result === undefined) {
          result = {};
        }

        result[key] = modified;
      }
    }

    return result;
  };

  return walk(fn.call({ '': obj }, '', obj));
}

function toMixedMultipart(data, bodyKey = 'data', form = new FormData()) {
  const replacer = (name, value, path) => {
    // Simple Blob
    if (value instanceof Blob) {
      form.append(path, value);

      return undefined;
    }

    // Array of Blobs
    if (Array.isArray(value) && value.every(v => (v instanceof Blob))) {
      value.forEach((v, i) => {
        form.append(`${path}[${i}]`, v);
      });

      return undefined;
    }

    return value;
  };

  const dataStr = JSON.stringify(data, replacerWithPath(replacer));

  form.append(bodyKey, dataStr);

  return form;
}

module.exports = toMixedMultipart;
