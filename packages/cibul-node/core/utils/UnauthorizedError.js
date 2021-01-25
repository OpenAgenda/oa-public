'use strict';
module.exports = class UnauthorizedError extends Error {
  constructor(objectName, identifier) {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.objectName = objectName;
    this.identifier = identifier;
  }
}
