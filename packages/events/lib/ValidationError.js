export default class ValidationError extends Error {
  constructor(errors) {
    super('Invalid data');
    this.name = 'ValidationError';
    this.detail = [].concat(errors);
    this.statusCode = 400;
  }
}
