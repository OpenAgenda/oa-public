'use strict';

const crypto = require('crypto');

function randomHash(length = 32) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  let salt = '';

  for (let i = 0; i < length; i++) {
    salt += chars[ Math.floor(Math.random() * chars.length) ];
  }

  return salt;
}

function hashPassword(password, salt) {
  return crypto
    .createHash('sha1')
    .update(salt + password)
    .digest('hex');
}

function verifyPassword(hashedPassword, password, salt) {
  return (
    hashedPassword
    === crypto
      .createHash('sha1')
      .update(salt + password, 'utf-8')
      .digest('hex')
  );
}

module.exports = {
  randomHash,
  hashPassword,
  verifyPassword
};
