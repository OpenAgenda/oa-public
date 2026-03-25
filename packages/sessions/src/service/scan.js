import { callbackify } from './helpers/index.js';

async function scan(config, cursor, limit) {
  let iterationFetches = [];
  let updatedCursor = -1;

  while (iterationFetches.length < limit && updatedCursor !== 0) {
    if (updatedCursor === -1) {
      updatedCursor = cursor;
    }

    const result = await config.redisClient.scan(
      updatedCursor,
      'MATCH',
      `${config.redis.prefix}*`,
      'COUNT',
      limit,
    );

    updatedCursor = parseInt(result[0], 10);

    iterationFetches = iterationFetches.concat(result[1]);
  }

  const fetchedSessions = [];

  for (const key of iterationFetches) {
    fetchedSessions.push(
      JSON.parse(
        await config.redisClient.get([config.redis.prefix, key].join(':')),
      ),
    );
  }

  return {
    sessions: fetchedSessions,
    cursor: updatedCursor,
  };
}

function extractArgs([config, cursor, count, options, cb]) {
  if (cb === undefined && options === undefined) {
    return {
      config,
      cursor,
      count: 10,
      options: {},
      cb: count,
    };
  }

  if (cb === undefined) {
    return {
      config,
      cursor,
      count,
      options: {},
      cb: options,
    };
  }

  return {
    config,
    cursor,
    count,
    options,
    cb,
  };
}

export default function callbackifiedScan(...args) {
  const { config, cursor, count, options, cb } = extractArgs(args);

  callbackify(scan(config, cursor, count, options), (err, r) => {
    if (err) return cb(err);

    cb(null, r.sessions, r.cursor);
  });
}
