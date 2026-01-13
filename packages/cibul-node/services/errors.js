import logs from '@openagenda/logs';

const log = logs('uncaught');

// Because it's should be already catched by Sentry
if (log.transports.sentry) {
  log.remove('sentry');
}

function handler(namespace, err, req) {
  try {
    throw err;
  } catch (error) {
    const obj = {
      error,
      namespace,
    };

    if (req) {
      Object.assign(obj, {
        url: req.originalUrl,
        ip: (req.header('x-forwarded-for') || '').split(', ').shift(),
        userUid: req.user && req.user.uid ? req.user.uid : null,
      });
    }

    log.error(obj);
  }
}

process.on('uncaughtException', (err) => handler('uncaughtException', err));

process.on('unhandledRejection', (err) => handler('unhandledRejection', err));

export default handler;

export function init(c) {
  log.setConfig(c.getLogConfig('oa', 'errors', false));
  if (log.transports.sentry) {
    log.remove('sentry');
  }
  return handler;
}
