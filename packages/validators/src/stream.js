import { Stream } from 'stream';

export default config => {
  const params = {
    field: undefined,
    list: false,
    type: 'stream',
    optional: true,
    ...config
  };

  return Object.assign(value => {
    if (value === undefined || value === null && params.optional) {
      return value;
    }

    if (
      typeof value === 'object' &&
      value instanceof Stream &&
      typeof (value._read === 'function') &&
      typeof (value._readableState === 'object')
    ) {
      return value;
    }

    throw [{
      origin: value,
      field: params.field,
      code: 'stream.invalid',
      message: 'value is not a stream'
    }];
  }, {
    type: 'stream',
    field: params.field
  });
};

