import _ from 'lodash';
import logs from '@openagenda/logs';
import convertEventToLegacyFormat from '@openagenda/legacy/convertEventToLegacyFormat/index.js';
import convertLegacyFilter from '@openagenda/legacy/convertLegacyFilter/index.js';
import renderHTMLFromMarkdown from '@openagenda/legacy/utils/renderHTMLFromMarkdown.js';
import track from '../lib/track.js';
import legacySettings from '../lib/legacySettings.js';

const log = logs('ConvertFormat');

export default function ConvertFormat({
  forceLimit = null,
  sendJSON = false,
  forceIncludeEmbedded = false,
  admin = false,
  trackInfos = null,
}) {
  return async (req, res, next) => {
    const { core } = req.app.services;

    const config = core.getConfig();

    const formSchema = await req.app.core
      .agendas(req.params.uid)
      .settings.schema.getMerged({
        access: 'internal',
      });

    const { tagSet, categorySet } = legacySettings.generate(formSchema);

    const nav = req.query.page
      ? {
        from: (parseInt(req.query.page, 10) - 1) * 20,
        size: forceLimit === null ? req.query.limit ?? 20 : forceLimit,
      }
      : {
        from: parseInt(req.query.offset ?? 0, 10),
        size:
            forceLimit === null
              ? parseInt(req.query.limit ?? 20, 10)
              : forceLimit,
      };

    req.query = _.omit(
      {
        ...convertLegacyFilter(req.query.oaq ?? {}, {
          formSchema,
          tagSet,
          categorySet,
          query: req.query,
        }),
        ...req.query,
      },
      ['page', 'oaq'],
    );

    const agenda = await req.app.core.agendas(req.params.uid).get({
      private: admin ? null : undefined,
    });

    if (!agenda) {
      return next({ code: 404 });
    }

    if (trackInfos) {
      track(req, agenda, ...trackInfos);
    }

    const { result: eventsList, error } = await req.app.core
      .agendas(req.params.uid)
      .events.search(req.query, nav, {
        detailed: true,
        access: 'administrator',
        includeLocationImagePath: true,
      })
      .then(
        (result) => ({ result }),
        (e) => ({ error: e }),
      );

    if (error) {
      return next(error);
    }

    const agendaSettings = {
      uid: req.params.uid,
      slug: agenda.slug,
      legacy: {
        tagSet,
        categorySet,
      },
      formSchema,
      interfaces: {
        renderHTMLFromMarkdown: renderHTMLFromMarkdown.bind(
          null,
          req.app.services,
          {
            includeEmbedded:
              forceIncludeEmbedded || req.query.include_embedded === '1',
          },
        ),
      },
      admin,
      root: config.root,
    };

    const convertedEvents = eventsList.events.map((event) => {
      try {
        return convertEventToLegacyFormat(agendaSettings, event, {
          locationTagLang: req.query.locationTagLang ?? 'fr',
        });
      } catch (e) {
        log.error('exception while converting to legacy event format', {
          error: e,
          agendaUID: agenda.uid,
          eventUID: event.uid,
        });
        throw e;
      }
    });

    const response = {
      total: eventsList.total,
      offset: nav.from,
      limit: nav.size,
      events: convertedEvents,
    };

    const readme = '⚠️⚠️⚠️Use the API rather than this legacy export. 👉 https://developers.openagenda.com | Results are paginated. Legacy export documentation: https://developers.openagenda.com/export-json-dun-agenda/';

    if (sendJSON && req.query.callback) {
      res.set('Content-Type', 'application/javascript');
      res.send(
        `${req.query.callback}(${JSON.stringify({
          readme,
          ...response,
        })})`,
      );
    } else if (sendJSON) {
      res.json({
        readme,
        ...response,
      });
    } else {
      Object.assign(req, response);
      next();
    }
  };
}
