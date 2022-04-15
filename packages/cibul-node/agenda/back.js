'use strict';

const fs = require('fs');
const _ = require('lodash');

const layout = require('../services/lib/layouts').load('agendaAdmin');

const statsTemplate = _.template(fs.readFileSync(__dirname + '/stats.tpl', 'utf-8'));

module.exports = app => {
  const {
    agendas, members, sessions, agendaStatistics
  } = app.services;

  const agendaLoad = agendas.middleware.load({
    private: null,
    internal: true,
    includeImagePath: true,
    namespaces: {
      identifiers: {
        slug: 'params.agendaSlug',
        uid: 'params.agendaUid'
      }
    }
  });

  /**
   * stats routes are hit by a ping script and need to be accessible
   */
  app.use([
    '/:agendaSlug/admin/stats',
    '/:agendaSlug/admin/stats/resync/:type'
  ], [
    sessions.mw.load(),
    agendaLoad,
    agendas.mw.authorizeByIPAddress(),
    members.mw.authorizeAdminModOrKey()
  ]);


  app.get('/agendas/:agendaUid/admin(/*?)?', agendaAdminRedirect);


  /**
   * statistics route
   */

  app.get(
    '/:agendaSlug/admin/stats',
    async (req, res, next) => res.send(layout(
      statsTemplate(await agendaStatistics(req.agenda.uid)),
      { ...req, role: req.member.role }
    ))
  )

  app.get('/:agendaSlug/admin/stats/transfer-form-schema', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.createFormSchema()
    );
  });

  app.get('/:agendaSlug/admin/stats/transfer-to-tagset', async (req, res) => res.json(
    await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateTagSet({ lang: req.lang })
  ));

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

  app.get('/:agendaSlug/admin/stats/resync/:type', (req, res) => {
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
