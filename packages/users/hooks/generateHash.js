import _ from 'lodash';
import hooksCommon from 'feathers-hooks-common';
import * as crypto from '../utils/crypto.js';

const { alterItems } = hooksCommon;

export default function generateHash(field) {
  return alterItems((rec) => _.set(rec, field, crypto.randomHash()));
}
