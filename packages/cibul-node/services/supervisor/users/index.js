import { requireUser } from '../../../lib/authGuards.js';
import getLogs from './getLogs.js';

export function plugApp(app, base = '/users') {
  const { users, supervisor } = app.services;

  app.get(
    `${base}/logs`,
    requireUser,
    users.mw.allowSuperAdmin(),
    async (req, res, next) => {
      const { userUid, from, to } = req.query;
      if (!userUid) {
        return next(new Error('userUid is required'));
      }

      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      res.write('event: connected\n');
      res.write('data: {"status": "connected"}\n\n');

      try {
        // Stream logs using the generator
        for await (const result of supervisor.users.getLogs({
          userUid,
          from,
          to,
        })) {
          res.write(`event: ${result.type}\n`);
          res.write(`data: ${JSON.stringify(result.data)}\n\n`);
        }

        res.end();
      } catch (streamError) {
        res.write('event: error\n');
        res.write(
          `data: ${JSON.stringify({ error: streamError.message })}\n\n`,
        );
        res.end();
      }
    },
  );
}

export function init(config, _services) {
  return {
    getLogs: ({ userUid, from, to }) =>
      getLogs(
        { userUid, from, to },
        {
          apiKey: config.insightOps.apiKey,
          logToken: '0f890359-4cce-411c-8ab4-c6cd2347d2e6',
        },
      ),
  };
}
