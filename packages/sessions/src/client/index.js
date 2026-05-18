import _ from 'lodash';
import base64 from '@openagenda/utils/base64.js';
import cookies from 'js-cookie';
import config from '../iso/config.js';
import * as validate from '../iso/cookie.validate.js';

function _get(name, validateFn, useDefault = false) {
  const cookieValue = cookies.get(name);
  let clean;

  if (!cookieValue) return useDefault ? validateFn.default : null;

  try {
    clean = validateFn(JSON.parse(base64.decode(cookieValue)));
  } catch (e) {
    return useDefault ? validateFn.default : null;
  }

  return clean;
}

function _getSession() {
  return (
    _get(config.cookies.session, validate.default)
    || validate.validateUnlogged.defaultValue
  );
}

function _getWritable() {
  return _get(config.cookies.writable, validate.writable, true);
}

function _setWritable(update) {
  let clean;

  try {
    clean = validate.writable(update);
  } catch (e) {
    clean = {};
  }

  cookies.set(config.cookies.writable, base64.encode(JSON.stringify(clean)), {
    secure: true,
    sameSite: 'Lax',
  });
}

function getUser() {
  return _getSession().user || null;
}

function getExpires() {
  const date = _getSession().expires || null;

  return date ? new Date(date) : null;
}

function isLogged() {
  return !!getUser();
}

function flash() {
  const values = _getWritable();

  const flashText = values ? values.flash : null;

  _setWritable(_.extend(values, { flash: null }));

  return flashText;
}

export default {
  getUser,
  getExpires,
  isLogged,
  flash,
};
