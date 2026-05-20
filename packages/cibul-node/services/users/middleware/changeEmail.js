import fs from 'node:fs';
import _ from 'lodash';
import { fromMarkdownToHTML } from '@openagenda/md';
import logs from '@openagenda/logs';
import labels from '@openagenda/labels/users/settings.js';
import errorLabels from '@openagenda/labels/errors/index.js';
import makeLabelGetter from '@openagenda/labels';
import cmn from '../../../lib/commons-app.js';
import { setFlash } from '../../../lib/flash.js';
import { redirectToSignin } from '../../../lib/authGuards.js';
import resetCache from '../lib/resetCache.js';
import layouts from '../../lib/layouts/index.js';

const renderChangeEmailError = _.template(
  fs.readFileSync(`${import.meta.dirname}/changeEmailError.tpl`, 'utf-8'),
);

const getLabel = makeLabelGetter(labels);
const getErrorLabel = makeLabelGetter(errorLabels);

const log = logs('services/users/middleware/changeEmail');

function send(req, res, next) {
  const { mails, core, users } = req.app.services;

  const config = core.getConfig();

  if (res.data) {
    users
      .get(res.data.uid, { internal: true })
      .then((user) => {
        const email = user.store && user.store.newEmail;
        const token = user.store && user.store.newEmailToken;

        if (!token) {
          return next();
        }

        log.info('sending email', {
          userUid: req.user.uid,
        });

        mails.send({
          template: 'changeEmail',
          to: email,
          data: {
            link: `${config.root}/users/me/confirmChangeEmail?token=${token}`,
          },
          lang: req.lang,
        });

        next();
      })
      .catch(next);
  }
}

function onError(err, req, res) {
  if (!req.user) {
    log.info('not signed in, redirecting to signin page');
    return redirectToSignin(req, res);
  }

  if (err.code === 400) {
    err.message = 'badChangeEmailToken';
    log.info('email change failed', {
      userUid: req.user.uid,
    });

    return res.send(
      layouts.main(
        renderChangeEmailError({
          title: getErrorLabel('changeEmailErrorTitle', req.lang),
          message: fromMarkdownToHTML(
            getErrorLabel('changeEmailError', req.lang),
          ),
          contactSupport: getErrorLabel('contactSupport', req.lang),
        }),
        {
          lang: req.lang,
          title: getErrorLabel('changeEmailErrorTitle', req.lang),
          cspNonce: res.locals.cspNonce,
        },
      ),
    );
  }
  cmn.catchError(req, res)(err);
}

function onSuccess(req, res) {
  log.info('email changed successfully', {
    userUid: req.user.uid,
  });
  resetCache(req.app.services, req.user).then(() => {
    setFlash(res, getLabel('changeEmailSuccess', req.lang));
    res.redirect('/home');
  });
}

export default {
  send,
  onError,
  onSuccess,
};
