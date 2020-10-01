import isStream from 'is-stream';

function isFile(value) {
  return isStream(value) || (value && value.path);
}

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

    if (isFile(value)) {
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

