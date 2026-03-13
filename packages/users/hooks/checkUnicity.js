import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';

export default function checkUnicity(field, dataKey = `data.${field}`) {
  return async (context) => {
    if (!_.get(context, dataKey)) {
      return;
    }

    const result = await context.self.find({
      query: {
        [field]: _.get(context, dataKey),
        $limit: 0,
      },
    });

    if (result.total !== 0) {
      throw new BadRequest('Already exist');
    }
  };
}
