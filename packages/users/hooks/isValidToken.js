import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';

export default function isValidToken(localKey, foreignKey) {
  return (context) => {
    const localValue = _.get(context, localKey);
    const foreignValue = _.get(context, foreignKey);

    if (typeof foreignValue === 'undefined' || localValue !== foreignValue) {
      throw new BadRequest('Bad token');
    }
  };
}
