import isStream from 'is-stream';
import errors from './lib/errors';

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
    if (value === undefined && !params.optional) {
      throw errors(params, value, 'required', 'a stream is required');
    }

    if (value === undefined) {
      return params.default;
    }

    if (isFile(value)) {
      return value;
    }

    throw errors(params, value, 'invalid', 'value is not a stream');
  }, {
    type: 'stream',
    field: params.field
  });
};

