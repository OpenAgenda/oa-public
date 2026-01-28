import logs from '@openagenda/logs';

// let service;
let config;
let agendasSvc;

const defaultFields = [
  { field: 'image', fieldType: 'abstract' },
  { field: 'imageCredits', fieldType: 'abstract' },
  { field: 'languages', fieldType: 'abstract' },
  { field: 'title', fieldType: 'abstract' },
  { field: 'description', fieldType: 'abstract' },
  { field: 'keywords', fieldType: 'abstract' },
  { field: 'longDescription', fieldType: 'abstract' },
  { field: 'conditions', fieldType: 'abstract' },
  { field: 'age', fieldType: 'abstract' },
  { field: 'registration', fieldType: 'abstract' },
  { field: 'accessibility', fieldType: 'abstract' },
  { field: 'attendanceMode', fieldType: 'abstract' },
  { field: 'location', fieldType: 'abstract' },
  { field: 'onlineAccessLink', fieldType: 'abstract' },
  { field: 'status', fieldType: 'abstract' },
  { field: 'timings', fieldType: 'abstract' },
];

function init(s, c) {
  // service = s;
  config = c;

  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  agendasSvc = config.services.agendas;
}

function create(req, res, next) {
  agendasSvc
    .set(Object.assign(req.body, { ownerId: req.user.id }), { private: null })
    .then(async (result) => {
      if (result.errors.length) res.status(400);

      const { core } = req.app.services;

      if (core) {
        // skip for testing
        const { onlineEvents } = req.body;

        if (onlineEvents) {
          const fields = defaultFields.map((v) => {
            if (
              onlineEvents
              && (v.field === 'onlineAccessLink' || v.field === 'attendanceMode')
            ) {
              return { ...v, display: true };
            }

            return v;
          });

          try {
            await core
              .agendas(result.agenda.uid)
              .settings.schema.updateFields(fields);
          } catch (e) {
            return next(e);
          }
        }
      }

      return res.json(result);
    }, next);
}

function get(req, res, next) {
  agendasSvc
    .get(
      { uid: req.params.uid },
      { includeImagePath: true, private: null, internal: true },
    )
    .then((result) => res.json(result), next);
}

// only fo storybook, to remove one day
function set(req, res, next) {
  agendasSvc
    .set({ slug: req.params.slug }, req.body, {
      includeImagePath: true,
      private: null,
      context: req.context || null,
      internal: true,
    })
    .then((result) => {
      if (result.errors.length) res.status(400);

      return res.json(result);
    }, next);
}

export default {
  init,
  create,
  get,
  set,
};
