import _ from 'lodash';
import * as crypto from '../utils/crypto.js';

export default function hashPassword(passwordKey, saltKey) {
  return (context) => {
    context.data.password = crypto.hashPassword(
      _.get(context, passwordKey),
      _.get(context, saltKey),
    );
  };
}
