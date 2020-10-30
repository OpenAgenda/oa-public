'use strict';

module.exports = class BadRequest extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.detail = detail;
  }
}
