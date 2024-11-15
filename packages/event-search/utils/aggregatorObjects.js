import base64 from '@openagenda/utils/base64.js';

export function flatten(obj, fields) {
  return base64.encode(
    JSON.stringify(
      fields.reduce(
        (picked, field) => ({
          ...picked,
          [field]: obj[field],
        }),
        {},
      ),
    ),
  );
}

export function inflate(obj) {
  return JSON.parse(base64.decode(obj));
}
