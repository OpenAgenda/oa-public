import { readFileSync } from 'node:fs';
import _ from 'lodash';
import { NotFound } from '@openagenda/verror';

const isDev = process.env.NODE_ENV === 'development';

const redirectTemplate = _.template(
  readFileSync(`${import.meta.dirname}/redirect.tpl`, 'utf-8'),
);

function render(req, res) {
  res.send(
    redirectTemplate({
      metas: req.metas,
      agenda: req.agenda,
      event: req.event,
      redirect: req.redirect,
    }),
  );
}

function loadFacebookMetas(req, res, next) {
  const { core } = req.app.services;
  const { root } = core.getConfig();

  req.redirect = req.siteURL
    ? `${req.siteURL}?oaq[uid][]=${req.event.uid}`
    : `/${req.agenda.slug}/events/${req.event.uid}_${req.event.slug}`;

  req.metas = [
    {
      property: 'og:title',
      content: _.escape(req.event.title),
    },
    {
      property: 'og:description',
      content: _.escape(req.event.description),
    },
    {
      property: 'og:locale',
      content: req.lang,
    },
    {
      property: 'og:url',
      content: `${root}/agendas/${req.params.agendaUid}/events/${req.params.eventUid}/share`,
    },
  ];

  if (_.get(req, 'event.image.filename')) {
    const imageUrl = req.event.image.base + req.event.image.filename;
    req.metas.push({
      property: 'og:image',
      content: isDev ? imageUrl.replace('dev', 'main') : imageUrl,
    });
  }

  next();
}

function loadEvent(req, res, next) {
  const { core } = req.app.services;

  core
    .agendas(req.params.agendaUid)
    .events.get(req.params.eventUid, {
      lang: req.lang,
      access: 'internal',
      returnPayload: true,
      private: null,
    })
    .then(
      (payload) => {
        const { event, agenda } = payload;

        if (!event) {
          return next(new NotFound());
        }

        req.agenda = agenda;
        req.event = event;

        next();
      },
      (err) => {
        req.log.error(err);

        next({
          code:
            err.statusCode
            || (!_.get(err, 'message').includes('not found') ? 500 : 404),
        });
      },
    );
}

export default {
  loadEvent,
  loadFacebookMetas,
  render,
};
