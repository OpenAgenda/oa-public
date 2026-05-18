import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/newsletter/subscribe.js';
import logs from '@openagenda/logs';

import { BadRequest } from '@openagenda/verror';

import isEmail from 'validator/lib/isEmail.js';
import { setFlash } from './flash.js';

const log = logs('newsletter');

const __ = makeLabelGetter(labels);

const getRedirectURL = (req) =>
  (req.query.origin === 'signup' ? '/signup/complete' : '/');

const respond = (req, res, flashLabel = 'subscribed') => {
  if (req.headers['content-type'] === 'application/json') {
    res.json({});
    return;
  }

  setFlash(res, __(flashLabel, req.lang));

  res.redirect(302, getRedirectURL(req));
};

export default async function newsletterSubscribe(req, res) {
  const { newsletter, mails } = req.app.services;

  try {
    const email = req.body?.email || req.user?.email;

    if (!isEmail(email)) {
      throw new BadRequest('Not an email');
    }

    await newsletter.addSubscriber(email);

    log('info', 'Nouvel inscrit à la newsletter: %s', email, {
      email,
    });

    respond(req, res);

    mails.send({
      to: 'admin@openagenda.com',
      subject: 'Nouvel inscrit à la newsletter',
      text: `"${email}" a été ajouté à la newsletter.`,
    });
  } catch (err) {
    log('error', { service: 'newsletter', message: err.message, error: err });

    respond(req, res, 'invalidEmail');
  }
}
