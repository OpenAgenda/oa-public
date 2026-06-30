import schema from '@openagenda/validators/schema/index';
import textValidator from '@openagenda/validators/text';
import linkValidator from '@openagenda/validators/link';

const requiredError = (field = null) => [
  {
    code: 'required',
    message: 'A value is required',
    field,
  },
];

const tooBigError = (field = null, maxSize = 20 * 1024 * 1024) => [
  {
    code: 'file.tooBig',
    message: 'File is too big',
    field,
    maxSize,
  },
];

const invalidExtensionError = (field = null, extensions = []) => [
  {
    code: 'file.invalidExtension',
    message: 'File extension is not allowed',
    field,
    extensions,
  },
];

schema.register({
  text: textValidator,
  link: linkValidator,
});

const baseFields = {
  extension: {
    type: 'text',
  },
  originalName: {
    type: 'text',
  },
  filename: {
    type: 'text',
  },
  fileSize: {
    type: 'integer',
  },
};

// Percent-encode an image URL idempotently so that unencoded special characters
// (most notably spaces) don't get rejected by the `link` validator, which throws
// `link.invalid` on any whitespace. Already-encoded URLs are fully decoded first,
// then re-encoded once, so calling this twice is a no-op. `encodeURI` leaves
// URL-significant characters (`&`, `/`, `?`, `=`, …) untouched. On a malformed
// sequence we leave the URL as-is and let the `link` validator reject it.
function normalizeURL(url) {
  if (typeof url !== 'string') {
    return url;
  }

  try {
    let decoded = url;
    while (decodeURI(decoded) !== decoded) {
      decoded = decodeURI(decoded);
    }
    return encodeURI(decoded);
  } catch (e) {
    return url;
  }
}

function isEmptyObject(obj, visited = new Set()) {
  if (obj === null || typeof obj === 'undefined') {
    return true;
  }

  if (Array.isArray(obj) && obj.length === 0) {
    return true;
  }

  if (typeof obj === 'object' && Object.keys(obj).length === 0) {
    return true;
  }

  if (typeof obj !== 'object') {
    return !obj;
  }

  if (visited.has(obj)) {
    return true;
  }

  visited.add(obj);

  for (const key in obj) {
    if (!isEmptyObject(obj[key], visited)) {
      return false;
    }
  }

  return true;
}

export default (validatorOptions = {}) =>
  (v) => {
    const optional = validatorOptions?.optional === undefined
      ? true
      : validatorOptions?.optional;

    const isEmpty = !v || isEmptyObject(v);

    if (!optional && isEmpty) {
      throw requiredError(validatorOptions?.field);
    }

    if (isEmpty) {
      return null;
    }

    const maxSize = validatorOptions?.maxSize === undefined ? 20 * 1024 * 1024 : null;

    if (maxSize && v.fileSize > maxSize) {
      throw tooBigError(validatorOptions?.field, maxSize);
    }

    const allowedExtensions = validatorOptions?.extensions;
    if (allowedExtensions?.length && v.extension) {
      const normalized = String(v.extension).toLowerCase();
      const normalizedAllowed = allowedExtensions.map((e) =>
        String(e).toLowerCase());
      if (!normalizedAllowed.includes(normalized)) {
        throw invalidExtensionError(validatorOptions?.field, allowedExtensions);
      }
    }

    const fields = {
      ...baseFields,
    };

    let value = v;

    if (validatorOptions?.allowPath && v?.path) {
      fields.path = { type: 'text' };
    } else if (validatorOptions?.allowURL && v?.url) {
      value = { ...v, url: normalizeURL(v.url) };
      fields.url = { type: 'link' };
    }

    if (validatorOptions?.imageWithSizeAndVariants) {
      fields.size = {
        width: {
          type: 'integer',
          default: null,
        },
        height: {
          type: 'integer',
          default: null,
        },
      };

      fields.variants = {
        list: true,
        fields: {
          type: { type: 'text' },
          filename: { type: 'text' },
          size: { ...fields.size },
        },
      };
    }

    const clean = schema(fields)(value);

    if (isEmptyObject(clean)) {
      return null;
    }

    // Remove undefined fields from the result
    const filteredClean = Object.keys(clean).reduce((acc, key) => {
      if (clean[key] !== undefined) {
        acc[key] = clean[key];
      }
      return acc;
    }, {});

    return filteredClean;
  };
