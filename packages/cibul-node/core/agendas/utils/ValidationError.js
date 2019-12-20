'use strict';

function ValidationError(validationErrors = []) {
    this.name = 'ValidationError';
    this.message = 'Provided data is not valid';
    this.detail = validationErrors;
}
ValidationError.prototype = new Error;

module.exports = ValidationError;
