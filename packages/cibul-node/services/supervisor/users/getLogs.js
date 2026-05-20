import logger from '@openagenda/logs';

const log = logger('supervisor/users/getLogs');

const INSIGHT_OPS_REGION = 'eu';
const LAST_N_HOURS = 24;

const ignoredPathPatterns = [
  'api',
  'js',
  'monit(\\?.*)?',
  'latest-inbox-timestamp',
  'notifications',
  'users\\/me(\\?.*)?',
  'home\\/inbox\\/author\\.json',
  'home\\/inbox\\/conversations\\.json\\?.*',
];

const IGNORED_HTTP_PATHS = new RegExp(
  `^\\/(?:${ignoredPathPatterns.join('|')})(?:\\/.*|)$`,
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isQueryInProgress(responseData) {
  if (!responseData.links) return false;
  const rels = responseData.links.map((link) => link.rel);
  return rels.includes('Self') && !rels.includes('Next');
}

function hasNextPage(responseData) {
  if (!responseData.links) return false;
  return responseData.links.some((link) => link.rel === 'Next');
}

async function pollToCompletion(initialResponse, apiKey) {
  let responseData = await initialResponse.json();
  let pollDelaySecs = 0.5;
  const maxPollDelaySecs = 6;

  while (isQueryInProgress(responseData)) {
    await sleep(pollDelaySecs * 1000);

    const links = Object.fromEntries(
      responseData.links.map((link) => [link.rel, link.href]),
    );
    const pollResponse = await fetch(links.Self, {
      headers: { 'x-api-key': apiKey },
    });

    if (!pollResponse.ok) throw pollResponse;

    responseData = await pollResponse.json();
    pollDelaySecs = Math.min(pollDelaySecs * 2, maxPollDelaySecs);
  }

  return responseData;
}

async function* executeQuery(query, params, config) {
  const { apiKey, logToken } = config;
  const toTsMillis = params.to ? params.to : Date.now();
  const fromTsMillis = params.from
    ? params.from
    : toTsMillis - LAST_N_HOURS * 60 * 60 * 1000;
  const baseUrl = `https://${INSIGHT_OPS_REGION}.rest.logs.insight.rapid7.com/query/logs/${logToken}`;

  const initialUrl = new URL(baseUrl);
  initialUrl.search = new URLSearchParams({
    query,
    ...params,
    from: fromTsMillis,
    to: toTsMillis,
  }).toString();
  let nextUrl = initialUrl.toString();
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await fetch(nextUrl, {
        headers: { 'x-api-key': apiKey },
      });

      if (!response.ok) throw response;

      const finalResponseData = await pollToCompletion(response, apiKey);

      let dataOnPage = [];
      if (finalResponseData.events) {
        dataOnPage = finalResponseData.events;
      } else if (finalResponseData.statistics?.groups) {
        dataOnPage = finalResponseData.statistics.groups;
      }

      // Yield the current page data
      if (dataOnPage.length > 0) {
        yield dataOnPage;
      }

      hasMorePages = hasNextPage(finalResponseData);
      if (hasMorePages) {
        const links = Object.fromEntries(
          finalResponseData.links.map((link) => [link.rel, link.href]),
        );
        nextUrl = links.Next;
      }
    } catch (error) {
      log.error('executeQuery error:', error);
      throw error;
    }
  }
}

export default async function* getLogs({ userUid, from, to }, config) {
  const visitorQuery = `where(meta.user.uid = "${userUid}") groupby("meta.visitor.id")`;

  let visitorIds = [];
  // Yield visitor data as it arrives
  for await (const visitorData of executeQuery(
    visitorQuery,
    { from, to },
    config,
  )) {
    if (visitorData && Array.isArray(visitorData)) {
      const newVisitorIds = visitorData.map((group) => Object.keys(group)[0]);
      visitorIds = visitorIds.concat(newVisitorIds);

      // Yield progress update for visitors
      yield {
        type: 'visitors',
        data: {
          visitorIds: newVisitorIds,
          total: visitorIds.length,
        },
      };
    }
  }

  if (visitorIds.length === 0) {
    yield {
      type: 'complete',
      data: {
        logs: [],
        message: 'No visitors found',
      },
    };
    return;
  }

  // Get actual logs with filtering in the query
  const visitorConditions = visitorIds
    .map((id) => `meta.visitor.id="${id}"`)
    .join(' OR ');
  const logsQuery = `where((${visitorConditions}) AND meta.url != ${IGNORED_HTTP_PATHS.toString()})`;

  let totalLogs = 0;
  // Yield log data as it arrives
  for await (const logsData of executeQuery(
    logsQuery,
    { from, to, most_recent_first: true, per_page: 500 },
    config,
  )) {
    if (logsData && Array.isArray(logsData)) {
      totalLogs += logsData.length;

      // Yield logs data
      yield {
        type: 'logs',
        data: {
          logs: logsData,
          total: totalLogs,
        },
      };
    }
  }

  // Final completion
  yield {
    type: 'complete',
    data: {
      total: totalLogs,
      message: 'Streaming complete',
    },
  };
}

export { executeQuery };
