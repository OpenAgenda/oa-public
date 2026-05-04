import _ from 'lodash';
import qs from 'qs';
import labels from '@openagenda/labels/auth/messages.js';
import cmn from '../../lib/commons-app.js';
import config from '../../config/index.js';

export const wantsJson = (req) => req.get('Accept') === 'application/json';

export const loadOptionals = (req) =>
  ['invitation', 'redirect', 'defaults', 'agenda', 'lang'].reduce(
    (optionals, key) =>
      (req.query[key]
        ? {
          ...optionals,
          [key]: req.query[key],
        }
        : optionals),
    {},
  );

/* eslint-disable prefer-rest-params */
export function render(template, defaults) {
  return function (values) {
    const asPromise = arguments.length === 1;

    const req = asPromise ? values.req : arguments[0];

    const res = asPromise ? values.res : arguments[1];

    let data = _.merge({}, defaults);

    data.culture = req.query.lang || req.lang;

    if (req.agenda) {
      data.agenda = {
        slug: req.agenda.slug,
        title: req.agenda.title,
        description: req.agenda.description,
        image: req.agenda.image,
        url: req.agenda.url,
      };

      data.indexed = req.agenda.indexed;
    }

    if (asPromise) {
      values.resolved = true;

      if (values.err) _.merge(data, values.err);

      data = _.merge(data, values.data ? values.data : {});
    } else {
      _.merge(data, arguments.length === 3 ? arguments[2] : {});
    }

    if (req.query.msg) {
      data.headMessage = labels[req.query.msg]
        ? labels[req.query.msg][req.lang]
        : false;
    }

    data.enabledServices = [];

    data.signin = `${req.agenda ? `/${req.agenda.slug}` : ''}/signin${qs.stringify(
      {
        ...loadOptionals(req),
      },
      { addQueryPrefix: true },
    )}`;
    data.signup = `${req.agenda ? `/${req.agenda.slug}` : ''}/signup${qs.stringify(
      {
        ...loadOptionals(req),
      },
      { addQueryPrefix: true },
    )}`;

    if (_.get(config, 'auth.facebook.id')) data.enabledServices.push('facebook');
    if (_.get(config, 'auth.google.id')) data.enabledServices.push('google');
    if (_.get(config, 'auth.twitter.key')) data.enabledServices.push('twitter');

    if (data.errors && Object.keys(data.errors).length > 0) {
      res.status(400);
    }

    _.set(data, 'scriptParams.lang', req.lang);

    if (wantsJson(req)) {
      const status = data.errors && Object.keys(data.errors).length > 0 ? 400 : 200;
      res.status(status).json({
        success: false,
        errors: data.errors || {},
        message: data.message || null,
      });
      return values;
    }

    cmn.render(req, res, template, data);

    return values;
  };
}
