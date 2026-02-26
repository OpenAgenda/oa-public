import fs from 'node:fs';
import _ from 'lodash';
import qs from 'qs';
import * as layouts from '../services/lib/layouts/index.js';

const layout = layouts.load('agendaAdmin');
const statsTemplate = _.template(
  fs.readFileSync(`${import.meta.dirname}/stats.tpl`, 'utf-8'),
);

/**
 * redirection admin route
 */

function agendaAdminRedirect(req, res, next) {
  if (/events\.(json|csv|xlsx|rss)|settings/.test(req.url)) {
    return next();
  }

  const { agendas } = req.app.services;

  agendas
    .get({ uid: req.params.agendaUid }, { private: null })
    .then((agenda) => {
      if (!agenda) {
        return next(
          new Error(`agenda not found ( uid ): ${req.params.agendaUid}`),
        );
      }

      res.redirect(
        req.originalUrl.replace(`/agendas/${agenda.uid}`, `/${agenda.slug}`),
      );
    }, next);
}

export default (app) => {
  const { agendas, members, sessions, agendaStatistics } = app.services;

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
  app.use(
    ['/:agendaSlug/admin/stats', '/:agendaSlug/admin/stats/resync/:type'],
    [
      sessions.mw.load(),
      agendaLoad,
      agendas.mw.authorizeByIPAddress(),
      members.mw.authorizeAdminModOrKey(),
    ],
  );

  app.get('/:agendaSlug/admin', (req, res) => {
    res.redirect(
      301,
      `/${req.params.agendaSlug}/admin/events${qs.stringify(req.query, { addQueryPrefix: true })}`,
    );
  });

  app.get('/agendas/:agendaUid/admin(/*?)?', agendaAdminRedirect);

  /**
   * statistics route
   */

  app.get('/:agendaSlug/admin/stats', async (req, res) =>
    res.send(
      layout(statsTemplate(await agendaStatistics(req.agenda.uid)), {
        ...req,
        role: req.member.role,
      }),
    ));
};
