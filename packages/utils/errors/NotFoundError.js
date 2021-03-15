'use strict';

module.exports = class NotFoundError extends Error {
  constructor(objectName, identifier) {
    super('Not found');
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.objectName = objectName;
    this.identifier = identifier;
  }
};
