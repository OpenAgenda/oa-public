import _ from 'lodash';
import { cleanString } from '@openagenda/utils';

export default (event) =>
  _.mapValues(event, (v) => {
    if (typeof v === 'string') {
      return cleanString(v.replace(/\v/g, ' ').replace(/\n/g, '\r\n'));
    }

    return v;
  });
