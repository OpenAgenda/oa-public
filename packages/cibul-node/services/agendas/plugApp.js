import agendaAdminLayout from '../lib/layouts/agendaAdmin/index.js';
import { requireUser } from '../../lib/authGuards.js';
import apiKeysPlugApp from './apiKeysPlugApp.js';

const defaultFields = [
  'image',
  'imageCredits',
  'languages',
  'title',
  'description',
  'keywords',
  'longDescription',
  'conditions',
  'age',
  'registration',
  'accessibility',
  'attendanceMode',
  'location',
  'onlineAccessLink',
  'status',
  'timings',
].map((field) => ({ field, fieldType: 'abstract' }));

const throwUnauthorized = (req, res, next) => {
  const error = new Error('Unauthorized');

  error.statusCode = 401;
  res.statusCode = 401;

  next(error);
};

const throwForbidden = (req, res, next) => {
  const error = new Error('Forbidden');

  error.statusCode = 403;
  res.statusCode = 403;

  next(error);
};

const checkUser = (req, res, next) => {
  if (!req.user) {
    return throwUnauthorized(req, res, next);
  }

  return next();
};

export default function plugApp(app) {
  const { agendas, members, core } = app.services;

  app.get(
    '/:agendaSlug/admin/layout',
    checkUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('moderator', { or: throwForbidden }),
    agendas.mw.authorizeByIPAddress(),
    async (req, res, next) => {
      try {
        res.send({
          member: req.member,
          schema: await core.agendas(req.agenda.uid).settings.schema.getMerged({
            includeMemberSchema: true,
            includeMember: true,
          }),
          ...agendaAdminLayout.parser({
            agenda: req.agenda,
            role: req.member.role,
            lang: req.lang,
          }),
        });
      } catch (e) {
        next(e);
      }
    },
  );

  app.get(
    '/:agendaSlug/settings/schema',
    agendas.mw.load,
    async (req, res, next) => {
      try {
        const schema = await req.app.services.core
          .agendas(req.agenda.uid)
          .settings.schema.getMerged();

        res.send({
          ...schema,
          fields: schema.fields.filter((field) => field.read === null), // Filter public fields
        });
      } catch (e) {
        next(e);
      }
    },
  );

  app.post(
    '/agendas/new',
    requireUser,
    agendas.getConfig().upload.middleware([{ name: 'image', unique: true }]),
    (req, res, next) => {
      agendas
        .set(Object.assign(req.body, { ownerId: req.user.id }), {
          private: null,
        })
        .then(async (result) => {
          if (result.errors.length) {
            res.status(400);
          }

          if (!req.body.onlineEvents) {
            return res.json(result);
          }

          try {
            await core.agendas(result.agenda.uid).settings.schema.updateFields(
              defaultFields.map((v) =>
                (['onlineAccessLink', 'attendanceMode'].includes(v.field)
                  ? {
                    ...v,
                    display: true,
                  }
                  : v)),
            );
          } catch (e) {
            return next(e);
          }
          return res.json(result);
        }, next);
    },
  );

  app.post('/agendas/slugs/available', requireUser, (req, res, next) => {
    agendas
      .isSlugAvailable(req.body.slug)
      .then((available) => res.json({ available }))
      .catch(next);
  });

  app.get(
    '/agendas/:uid/admin/settings.json',
    requireUser,
    agendas.mw.loadBy({
      path: 'params.uid',
      field: 'uid',
    }),
    members.mw.loadAndAuthorize('administrator'),
    (req, res) => res.json(req.agenda),
  );

  app.post(
    '/:agendaSlug/admin/settings/edit',
    requireUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    agendas.getConfig().upload.middleware([{ name: 'image', unique: true }]),
    (req, res, next) => {
      core
        .agendas(req.agenda)
        .update(req.body, {
          includeImagePath: true,
          private: null,
          context: { user: req.user },
          internal: true,
        })
        .then(
          (agenda) => res.json({ success: true, agenda }),
          (err) =>
            (err.name === 'BadRequest' ? res.status(400).json(err) : next(err)),
        );
    },
  );

  apiKeysPlugApp(app);
}
