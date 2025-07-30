import { randomBytes } from 'node:crypto';
import _ from 'lodash';
import cookieSessionLib from 'cookie-session';
import cookieParserLib from 'cookie-parser';
import onHeaders from 'on-headers';
import { validateUnlogged } from './iso/cookie.validate.js';

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

function use(config, { cookieSession, cookieParser }, req, res, next) {
  cookieParser(req, res, (_err) => {
    cookieSession(req, res, (err) => {
      if (err) return next(err);

      onHeaders(res, () => {
        const sess = req.session;

        if (sess === undefined) {
          // not accessed
          return;
        }

        try {
          if (sess === false || sess === null) {
            // remove
            res.cookie(config.userCookie.name, '');
          } else if ((!sess.isNew || sess.isPopulated) && sess.isChanged) {
            // save populated or non-new changed session
            res.cookie(
              config.userCookie.name,
              Buffer.from(JSON.stringify(sess)).toString('base64'),
              {
                encode: (v) => v,
                expires: sess.expires ? new Date(sess.expires) : undefined,
                secure: config.userCookie.secure,
                sameSite: config.userCookie.sameSite,
              },
            );
          }
        } catch (e) {
          req.log.debug('error saving user cookie', e);
        }
      });

      if (Object.keys(req.session).length) {
        return next();
      }

      Object.keys(validateUnlogged.default).forEach((k) => {
        req.session[k] = validateUnlogged.default[k];
      });

      req.session.sessionId = randomBytes(12).toString('hex');

      next();
    });
  });
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

export default (sessions, config) => {
  const cookieSession = cookieSessionLib(config.sessionCookie);
  const cookieParser = cookieParserLib();

  return Object.assign(
    use.bind(null, config, { cookieSession, cookieParser }),
    {
      open: open.bind(null, { sessions }),
      load: load.bind(null, { sessions }),
      close: close.bind(null, { sessions }),
      sync: sync.bind(null, { sessions }),
      ifLogged: ifLoggedState.bind(null, sessions, true),
      ifUnlogged: ifLoggedState.bind(null, sessions, false),
    },
  );
};
