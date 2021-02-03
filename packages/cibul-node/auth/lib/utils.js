'use strict';

const _ = require('lodash');
const qs = require('qs');
const cmn = require('../../lib/commons-app');
const config = require('../../config');
const labels = require('@openagenda/labels/auth/messages');

const loadOptionals = req => [
  'iToken',
  'invitation',
  'redirect',
  'defaults',
  'agenda',
  'lang'
].reduce((optionals, key) => req.query[key] ? ({
  ...optionals,
  [key]: req.query[key]
}) : optionals, {});

function render(template, defaults) {

  return function (values) {

    var asPromise = arguments.length === 1,

      req = asPromise ? values.req : arguments[0],

      res = asPromise ? values.res : arguments[1],

      data = _.merge({}, defaults);

    data.culture = req.query.lang || req.lang;

    if (req.agenda) {

      data.agenda = {
        slug: req.agenda.slug,
        title: req.agenda.title,
        description: req.agenda.description,
        image: req.agenda.image,
        url: req.agenda.url
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

      data.headMessage = labels[req.query.msg] ? labels[req.query.msg][req.lang] : false;

    }

    data.enabledServices = [];

    data.signin = `${req.agenda ? '/' + req.agenda.slug : ''}/signin${qs.stringify({
      ...loadOptionals(req)
    }, { addQueryPrefix: true })}`;
    data.signup = `${req.agenda ? '/' + req.agenda.slug : ''}/signup${qs.stringify({
      ...loadOptionals(req)
    }, { addQueryPrefix: true })}`;

    if (_.get(config, 'auth.facebook.id')) data.enabledServices.push('facebook');
    if (_.get(config, 'auth.google.id')) data.enabledServices.push('google');
    if (_.get(config, 'auth.twitter.key')) data.enabledServices.push('twitter');

    if (data.errors && Object.keys(data.errors).length > 0) {
      res.status(400);
    }

    cmn.render(req, res, template, data);

    return values;

  }

}

module.exports = {
  loadOptionals,
  render
};
