import { BadRequest } from '@openagenda/verror';

export default function searchKeyword() {
  return (context) => {
    if ('$search' in context.params.query) {
      const search = context.params.query.$search;

      if (typeof search !== 'string') {
        throw new BadRequest('$search query keyword should be a string');
      }

      delete context.params.query.$search;

      const query = context.self.createQuery(context.params);

      query
        .where('full_name', 'like', `%${search}%`)
        .orWhere('email', 'like', `%${search}%`);

      context.params.knex = query;
    }

    return context;
  };
}
