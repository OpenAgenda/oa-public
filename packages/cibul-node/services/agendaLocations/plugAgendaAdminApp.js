import { pipeline } from 'node:stream';
import csv from 'fast-csv';
import ExcelJS from 'exceljs';
import loadLocationEndpoints from './lib/loadLocationEndpoints.js';
import transformLocationForFlatExport from './lib/transformLocationForFlatExport.js';
import isSIRETEnabled from './lib/isSIRETEnabled.js';

const extractIncludeFields = (req) => {
  req.query.includeFields = req.query.includeFields ?? req.query.if;

  if (!req.query.includeFields) {
    return [
      'uid',
      'name',
      'address',
      'city',
      'department',
      'postalCode',
      'region',
      'countryCode',
      'latitude',
      'longitude',
      'insee',
      'state',
      'extIds',
    ]
      .concat(isSIRETEnabled(req.agenda) ? 'siret' : [])
      .concat(['eventCount', 'agendaEventCount']);
  }

  return ['uid'].concat(
    typeof req.query.includeFields === 'string'
      ? req.query.includeFields.split(',')
      : req.query.includeFields,
  );
};

export default (services, instance, app, base) => {
  const { members, agendas, core } = services;

  app.use(
    `${base}*`,
    (req, res, next) => {
      core.agendas
        .slug(req.params.agendaSlug)
        .get({
          access: 'internal',
          detailed: true,
          throwNotFound: true,
          private: null,
        })
        .then((agenda) => {
          req.agenda = agenda;
          next();
        }, next);
    },
    agendas.mw.authorizeByIPAddress(),
    members.mw.authorizeAdminModOrKey({ agendaUidPath: 'agenda.uid' }),
    loadLocationEndpoints(instance),
  );

  app.get([`${base}.csv`, `${base}.xlsx`], (req, res, next) => {
    const includeFields = extractIncludeFields(req);
    const tagGroups = req.settings?.tagSet?.groups ?? [];

    req.locations
      .list(
        req.query,
        {},
        {
          context: { agendaUid: req.agenda.uid },
          stream: true,
          eventCounts: true,
          detailed: true,
          includeImagePath: true,
          // Load raw store tags only when the agenda defines tag groups, so we
          // can expand them into one column per group in the export.
          includeFields: tagGroups.length
            ? includeFields.concat('tags')
            : includeFields,
        },
      )
      .then((stream) => {
        req.stream = stream.pipe(
          transformLocationForFlatExport({
            includeFields,
            lang: req.lang,
            tagGroups,
          }),
        );
        next();
      }, next);
  });

  app.get(`${base}.csv`, (req, res) => {
    const csvStream = csv.format({
      headers: true,
      delimiter: ';',
      quote: '"',
      escape: '"',
    });

    res.once('close', () => {
      if (!req.stream.destroyed) req.stream.destroy();
    });

    pipeline(req.stream, csvStream, res, () => {});

    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'content-disposition': `attachment; filename="${req.agenda.slug}.locations.csv"`,
    });
  });

  app.get(`${base}.xlsx`, (req, res) => {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter();
    const worksheet = workbook.addWorksheet('Locations');
    const locations = [];

    req.stream.on('error', (err) => {
      if (!res.destroyed) res.destroy(err);
    });

    res.once('close', () => {
      if (!req.stream.destroyed) req.stream.destroy();
    });

    req.stream.on('data', (data) => {
      locations.push(data);
    });

    req.stream.on('end', () => {
      worksheet.columns = [
        ...new Set(
          locations.reduce((carry, data) =>
            Object.keys(data).map((key) => ({ header: key, key, width: 10 }))),
        ),
      ];

      for (const location of locations) {
        worksheet.addRow(location).commit();
      }

      workbook.commit();
    });

    workbook.stream.pipe(res);

    res.writeHead(200, {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="${req.agenda.slug}.locations.xlsx"`,
    });
  });

  app.get(`${base}/:locationUid.json`, (req, res, next) => {
    instance
      .get(req.params.locationUid, {
        includeImagePath: true,
        eventCounts: true,
        includeLinkedAgendas: true,
      })
      .then((location) => res.json(location), next);
  });

  app.get(`${base}/unverified`, (req, res, next) => {
    req.locations
      .list({ state: 0 }, { limit: 0 }, { total: true })
      .then(({ total }) => res.json({ count: total }), next);
  });

  app.get(`${base}/terms`, (req, res) => {
    req.locations
      .terms(req.query.field.split(','), {}, { filterNulls: true })
      .then((terms) => res.json({ terms }));
  });

  app.post(
    [`${base}`, `${base}/merge`, `${base}/:locationUid`],
    instance.imageTransformAndUpload.middleware([
      {
        name: 'image',
        unique: true,
      },
    ]),
  );

  app.post(`${base}`, (req, res, next) => {
    req.locations
      .create(
        { ...req.body, state: 1 },
        {
          includeImagePath: true,
          agendaUid: req.agenda?.uid,
          context: {
            userUid: req.user.uid,
            agendaUid: req.agenda?.uid,
            setUid: req.agenda?.setUid,
          },
        },
      )
      .then((location) => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.post(`${base}/disqualify`, (req, res, next) => {
    req.locations.duplicates
      .disqualifyCandidate(req.body.uids)
      .then((location) => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.post(`${base}/merge`, (req, res, next) => {
    req.locations
      .merge(req.body.mergeIn, { uids: req.body.merged }, null, {
        agendaUid: req.agenda?.uid,
      })
      .then(
        (location) =>
          res.json({
            location,
            success: true,
          }),
        next,
      );
  });

  app.post(`${base}/:locationUid`, async (req, res, next) => {
    try {
      req.locations
        .update(req.params.locationUid, req.body, {
          includeImagePath: true,
          eventCounts: true,
          agendaUid: req.agenda?.uid,
          context: {
            userUid: req.user.uid,
            agendaUid: req.agenda?.uid,
            setUid: req.agenda?.setUid,
          },
        })
        .then((location) => {
          res.json({
            location,
            success: true,
          });
        }, next);
    } catch (e) {
      next(e);
    }
  });

  app.delete(`${base}/:locationUid`, (req, res, next) => {
    req.locations
      .remove(req.params.locationUid, {
        includeImagePath: true,
        agendaUid: req.agenda?.uid,
        removeEvents: !!req.query.removeEvents,
      })
      .then((location) => {
        res.json({
          location,
          success: true,
        });
      }, next);
  });

  app.use(base, (err, req, res, next) => {
    if (err.name === 'BadRequest') {
      res.status(400).json({
        errors: err.info,
        success: false,
      });
    } else {
      next(err);
    }
  });
};
