import crypto from 'node:crypto';

export default (data) =>
  crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
