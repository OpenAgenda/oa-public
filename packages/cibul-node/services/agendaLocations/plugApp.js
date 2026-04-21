import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/locations/plugApp');

export default (config, services, instance, app, base) => {
  const { geocoder } = config;

  app.get(
    `${base}/:locationUid.json`,
    (req, res, next) => {
      instance
        .get(req.params.locationUid, {
          includeImagePath: true,
          includeFields: [
            'uid',
            'setUid',
            'slug',
            'name',
            'address',
            'countryCode',
            'adminLevel1',
            'adminLevel2',
            'adminLevel3',
            'adminLevel4',
            'adminLevel5',
            'district',
            'postalCode',
            'insee',
            'latitude',
            'longitude',
            'region',
            'department',
            'city',
            'timezone',
            'updatedAt',
            'createdAt',
            'image',
            'description',
            'tags',
            'website',
            'email',
            'phone',
            'links',
            'access',
            'state',
            'imageCredits',
            'extIds',
            'duplicateCandidates',
            'disqualifiedDuplicates',
            'mergedIn',
            'agendaUid',
            'siret',
          ],
        })
        .then((location) => res.json(location), next);
    },
    (err, req, res) => {
      res.status(500).json();
      log('error', err);
    },
  );

  app.get(`${base}/geocode`, (req, res, next) =>
    geocoder(req.query.address, {
      countryCode: req.query.countryCode,
      language: req.lang || 'fr',
    }).then((results) => res.send({ results }), next));

  app.get(`${base}/geocode/reverse`, (req, res, next) =>
    geocoder
      .reverse(req.query.latitude, req.query.longitude, {
        language: req.lang || 'fr',
      })
      .then((results) => res.send({ results }), next));

  app.get(`${base}/insee`, (req, res, next) =>
    instance.utils
      .getINSEECode(
        _.pick(req.query, ['city', 'department', 'latitude', 'longitude']),
      )
      .then((code) => res.json({ code }), next));

  app.use(base, (err, req, res, _next) => {
    res.status(500).json();
    log('error', err?.meta?.body?.error ?? err);
  });
};
