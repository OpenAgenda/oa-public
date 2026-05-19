import _ from 'lodash';

function _logLoad(req, data) {
  if (req.log && req.log.load) {
    req.log.load(data);
  }
}

function ifLoggedState(sessions, state, fn) {
  return (req, res, next) => {
    sessions
      .isLogged(req)

      .catch(next)

      .then((is) => {
        if (state === is) return fn(req, res, next);

        next();
      });
  };
}

function open(
  { sessions },
  identifierNamespace = 'userIdentifier',
  targetNamespace = 'result',
) {
  return (req, res, next) => {
    sessions.open(req, req[identifierNamespace], (err, result) => {
      if (err) return next(err);

      req[targetNamespace] = result;

      next();
    });
  };
}

/**
 * load session in req object
 */

function load({ sessions }, options) {
  const params = _.extend(
    {
      target: 'user',
      detailed: false,
    },
    options || {},
  );

  return (req, res, next) => {
    sessions.get(req, { detailed: params.detailed }, async (err, user) => {
      if (err) return next(err);

      // session is in cookie but not in redis
      if (req.session?.user && !user) {
        const { sessionId } = req.session;
        req.session = sessionId ? { sessionId } : null;
      }

      req[params.target] = user;

      _logLoad(req, { userUid: user ? user.uid : null });

      next();
    });
  };
}

function close({ sessions }, targetNamespace = 'result') {
  return (req, res, next) => {
    sessions.close(req, (err, result) => {
      if (err) return next(err);

      req[targetNamespace] = result;

      next();
    });
  };
}

/**
 * proxy for service sync method
 */
function sync({ sessions }, targetNamespace = 'result') {
  return (req, res, next) => {
    sessions.sync(req, (err, result) => {
      if (err) return next(err);

      req[targetNamespace] = result;

      next();
    });
  };
}

export default (sessions) => ({
  open: open.bind(null, { sessions }),
  load: load.bind(null, { sessions }),
  close: close.bind(null, { sessions }),
  sync: sync.bind(null, { sessions }),
  ifLogged: ifLoggedState.bind(null, sessions, true),
  ifUnlogged: ifLoggedState.bind(null, sessions, false),
});
