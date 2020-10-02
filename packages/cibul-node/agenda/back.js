"use strict";

const fs = require('fs');
const _ = require('lodash');
const agendaStatistics = require('../services/agendaStatistics');

const layout = require('../services/lib/layouts').load('agendaAdmin');

const agendaLoad = require('@openagenda/agendas').middleware.load({
  private: null,
  internal: true,
  namespaces: {
    identifiers: {
      slug: 'params.agendaSlug',
      uid: 'params.agendaUid'
    }
  }
});

const statsTemplate = _.template(fs.readFileSync(__dirname + '/stats.tpl', 'utf-8'));

module.exports = app => {
  const { members, sessions } = app.services;

  app.use('/:agendaSlug/admin/getting-started', [
    sessions.mw.loadOrRedirect(),
    agendaLoad,
    members.mw.loadAndAuthorize('administrator'),
    _gettingStarted
  ]);

  /**
   * stats routes are hit by a ping script and need to be accessible
   */
  app.use([
    '/:agendaSlug/admin/stats',
    '/:agendaSlug/admin/stats/resync/:type'
  ], [
    sessions.mw.load(),
    agendaLoad,
    members.mw.authorizeAdminModOrKey()
  ]);


  app.get('/agendas/:agendaUid/admin(/*?)?', agendaAdminRedirect);


  /**
   * statistics route
   */

  app.get(
    '/:agendaSlug/admin/stats',
    async (req, res, next) => res.send(layout(
      statsTemplate(await agendaStatistics(req.app.services, req.agenda.uid)),
      { ...req, role: req.member.role }
    ))
  )

  app.get('/:agendaSlug/admin/stats/transfer-form-schema', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.createFormSchema()
    );
  });

  app.get('/:agendaSlug/admin/stats/transfer-to-tagset', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateTagSet(req.query.force)
    );
  });

  app.get('/:agendaSlug/admin/stats/transfer-to-categoryset', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateCategorySet(req.query.force)
    );
  });

  app.get('/:agendaSlug/admin/stats/transfer-to-custom', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateCustom(req.query.force)
    );
  });


  /**
   * resync what can be
   */

  app.get('/:agendaSlug/admin/stats/resync/:type', (req, res, next) => {
    agendaStatistics.resync(req.agenda.uid, req.params.type);

    res.json({ operation: 'resyncing ' + req.params.type });
  });
}


/**
 * redirection admin route
 */

function agendaAdminRedirect(req, res, next) {
  if (/events\.(json|csv|xlsx|rss)|settings/.test(req.url)) {
    return next();
  }

  const { agendas } = req.app.services;

  agendas.get({ uid: req.params.agendaUid }, { private: null }, (err, agenda) => {
    if (err) return next(err);

    if (!agenda) return next(new Error('agenda not found ( uid ): ' + req.params.agendaUid));

    res.redirect(req.originalUrl.replace(`/agendas/${agenda.uid}`, `/${agenda.slug}`));
  });
}


/**
 * getting started route
 */

function _gettingStarted(req, res, next) {
  return res.send(layout(`<div class="js_canvas getting-started"></div>`, {
    lang: req.lang,
    agenda: req.agenda,
    role: req.member.role,
    bodyAttributes: [
      {
        name: 'data-options',
        value: JSON.stringify({
          res: {
            agenda: req.genUrl('agendaShow', { slug: req.agenda.slug }),
            addEvent: `/${req.agenda.slug}/contribute`,
            createEmbed: `/${req.agenda.slug}/admin/webembed`
          },
          lang: _.get(req, 'lang', 'fr')
        })
      }
    ],
    scripts: {
      bottom: [{ src: '/js/agendaAdminGettingStarted.js' }]
    }
  }));

}
