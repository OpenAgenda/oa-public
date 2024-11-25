import _ from 'lodash';

function _decode(req, name) {
  const encoded = req.cookies[name];

  let decoded = {};

  if (!encoded) return decoded;

  try {
    decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch (e) {
    /* console.log(e) */
  }

  return decoded;
}

export default (config, request, response) => {
  const { name } = config.writableCookie;

  const values = _decode(request, name);

  function clear() {
    if (typeof response.cookie !== 'function') return;

    response.cookie(
      name,
      Buffer.from(JSON.stringify({}), 'utf8').toString('base64'),
      { maxAge: 1 },
    );
  }

  function set(key, update) {
    _.set(values, key, update);

    const encoded = Buffer.from(JSON.stringify(values), 'utf8').toString(
      'base64',
    );

    request.cookies[name] = encoded;

    response.cookie(name, encoded, {
      maxAge: config.writableCookie.maxAge,
      secure: config.writableCookie.secure,
      sameSite: config.writableCookie.sameSite,
      encode: (str) => str,
    });
  }

  return {
    set,
    clear,
    get: () => values,
  };
};
