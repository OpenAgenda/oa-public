'use strict';

module.exports = class ValidationError extends Error {
  constructor(errors) {
    super('Invalid data');
    this.statusCode = 400;
    this.name = 'ValidationError';
    this.detail = errors;
  }
}
