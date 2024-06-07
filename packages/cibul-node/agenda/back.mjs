import fs from 'node:fs';
import _ from 'lodash';
import qs from 'qs';
import * as layouts from '../services/lib/layouts/index.js';

const layout = layouts.load('agendaAdmin');
const statsTemplate = _.template(fs.readFileSync(`${import.meta.dirname}/stats.tpl`, 'utf-8'));

/**
 * redirection admin route
 */

function agendaAdminRedirect({ url, app, params, originalUrl }, res, next) {
  if (/events\.(json|csv|xlsx|rss)|settings/.test(url)) {
    return next();
  }

  const { agendas } = app.services;

  agendas.get({ uid: params.agendaUid }, { private: null }, (err, agenda) => {
    if (err) return next(err);

    if (!agenda) return next(new Error(`agenda not found ( uid ): ${params.agendaUid}`));

    res.redirect(originalUrl.replace(`/agendas/${agenda.uid}`, `/${agenda.slug}`));
  });
}

export default app => {
  const {
    agendas,
    members,
    sessions,
    agendaStatistics,
  } = app.services;

  const agendaLoad = agendas.middleware.load({
    private: null,
    internal: true,
    includeImagePath: true,
    namespaces: {
      identifiers: {
        slug: 'params.agendaSlug',
        uid: 'params.agendaUid',
      },
    },
  });

  /**
   * stats routes are hit by a ping script and need to be accessible
   */
  app.use([
    '/:agendaSlug/admin/stats',
    '/:agendaSlug/admin/stats/resync/:type',
  ], [
    sessions.mw.load(),
    agendaLoad,
    agendas.mw.authorizeByIPAddress(),
    members.mw.authorizeAdminModOrKey(),
  ]);

  app.get('/:agendaSlug/admin', ({ params, query }, res) => {
    res.redirect(301, `/${params.agendaSlug}/admin/events${qs.stringify(query, { addQueryPrefix: true })}`);
  });

  app.get('/agendas/:agendaUid/admin(/*?)?', agendaAdminRedirect);

  /**
   * statistics route
   */

  app.get(
    '/:agendaSlug/admin/stats',
    async (req, res) => res.send(layout(
      statsTemplate(await agendaStatistics(req.agenda.uid)),
      { ...req, role: req.member.role },
    )),
  );

  app.get('/:agendaSlug/admin/stats/transfer-form-schema', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.createFormSchema());
  });

  app.get('/:agendaSlug/admin/stats/transfer-to-tagset', async (req, res) => res.json(
    await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateTagSet({ lang: req.lang }),
  ));

  app.get('/:agendaSlug/admin/stats/transfer-to-categoryset', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateCategorySet({ lang: req.lang }));
  });

  app.get('/:agendaSlug/admin/stats/transfer-to-custom', async (req, res) => {
    res.json(await req.app.services.core.agendas(req.agenda.uid)
      .settings.legacy.updateCustom(req.query.force));
  });

  /**
   * resync what can be
   */

  app.get('/:agendaSlug/admin/stats/resync/:type', ({ agenda, params }, res) => {
    agendaStatistics.resync(agenda.uid, params.type);

    res.json({ operation: `resyncing ${params.type}` });
  });
};
