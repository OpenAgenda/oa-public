import { BadRequest } from '@openagenda/verror';
import hooksCommon from 'feathers-hooks-common';

const { checkContext } = hooksCommon;

export default function stashBefore(prop, additionalParams = {}) {
  const beforeField = prop || 'before';

  return (context) => {
    checkContext(
      context,
      'before',
      ['get', 'update', 'patch', 'remove'],
      'stashBefore',
    );

    if (context.params.query && context.params.query.$disableStashBefore) {
      delete context.params.query.$disableStashBefore;
      return context;
    }

    if (
      (context.id === null || context.id === undefined)
      && !context.params.query
    ) {
      throw new BadRequest('Id is required. (stashBefore)');
    }

    const params = {
      ...context.method === 'get'
        ? context.params
        : {
          provider: context.params.provider,
          authenticated: context.params.authenticated,
          user: context.params.user,
        },
      ...additionalParams,
    };

    params.query = params.query || {};
    params.query.$disableStashBefore = true;

    return context.self.get(context.id, params).then((data) => {
      delete params.query.$disableStashBefore;

      context.params[beforeField] = JSON.parse(JSON.stringify(data));
      return context;
    });
  };
}
