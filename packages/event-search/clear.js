import getIndexName from './utils/getIndexName.js';

export default async function clear(config, set) {
  const { client, defaultIndex } = config;

  return client
    .deleteByQuery({
      index: getIndexName(set, defaultIndex),
      body: {
        query: {
          term: {
            _set: set,
          },
        },
      },
    })
    .then(({ body }) => body);
}
