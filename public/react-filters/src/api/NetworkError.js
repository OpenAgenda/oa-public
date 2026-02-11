import VError from '@openagenda/verror';

export default class NetworkError extends VError {
  constructor(cause, message = 'Network request failed') {
    super(cause, message);
    this.name = 'NetworkError';
  }
}
