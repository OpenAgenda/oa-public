'use strict';

const fs = require('fs');
const _ = require('lodash');
const marked = require('marked');
const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/event/addEvent'),
);
const layouts = require('../../lib/layouts');
const config = require('../../../config');

const renderAddEvent = _.template(
  fs.readFileSync(`${__dirname}/addEvent.tpl`, 'utf-8'),
);

module.exports = app => {
  const {
    agendas,
    events,
  } = app.services;

  app.get([
    '/:agendaSlug/addevent',
    '/:agendaSlug/event/:eventSlug/edit',
  ], [
    agendas.mw.load,
    (req, res, next) => {
      if (!req.agenda) return next({ code: 404 });
      next();
    },
    (req, res, next) => {
      if (!req.params.eventSlug) {
        return next();
      }
      events.get({ slug: req.params.eventSlug }).then(event => {
        req.event = event;
        next();
      });
    },
    (req, res, next) => {
      if (!req.agenda.credentials.useContributeApp) {
        return next();
      }
      res.redirect(
        301,
        req.event ? `/${req.agenda.slug}/contribute/event/${req.event.uid}` : `/${req.agenda.slug}/contribute`,
      );
    },
    (req, res) => {
      const layoutData = {
        agenda: req.agenda,
        lang: req.lang,
        title: '/addevent',
      };

      layoutData.translateMode = Boolean(req.cookies.translateMode);
      layoutData.isTranslator = req.user?.uid && config.translators.includes(req.user.uid);

      if (req.cookies.translateMode) {
        layoutData.scripts.top = [
          { body: 'window._jipt = [[\'project\', \'openagenda\']];' },
          { src: '//cdn.crowdin.com/jipt/jipt.js' },
        ];
      }

      res.send(layouts.agenda(renderAddEvent({
        title: getLabel('title', req.lang),
        message: marked(getLabel('message', req.lang)),
        support: getLabel('support', req.lang),
        supportLink: `/support?origin=${encodeURIComponent(`/${req.agenda.slug}/addevent`)}`,
      }), layoutData));
    },
  ]);
};
