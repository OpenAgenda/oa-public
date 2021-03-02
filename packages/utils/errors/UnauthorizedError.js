'use strict';
module.exports = class UnauthorizedError extends Error {
  constructor(objectName, identifier, message = 'Unauthorized') {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.objectName = objectName;
    this.identifier = identifier;
    this.message = message;
  }
}