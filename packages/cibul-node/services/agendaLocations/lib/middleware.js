'use strict';

const _ = require('lodash');
const fs = require('fs');

const flattenLocationTagSet = require('@openagenda/event-form/build/utils/flattenLocationTagSet');

module.exports.loadLocation = service => (req, res, next) => {
  service(req.agenda.uid).get(req.params.locationUid, {
    includeImagePath: true,
    eventCounts: req.query.detailed === '1'
  }).then(location => {
    if (!location) {
      return res.status(404).send();
    }
    req.location = location;
    next();
  }, next);
}

module.exports.parseDataWithImageStream = (req, res, next) => {
  req.data = JSON.parse(req.body.data);
  if (req.file) {
    req.data.image = fs.createReadStream(req.file.path);
    req.data.image.on('end', () => {
      fs.unlink(req.file.path, () => {});
    });
  }
  next();
}

module.exports.getLocationSettings = async (req, res, next) => {
  const {
    core,
  } = req.app.services;

  const schema = await core.agendas(req.agenda.uid).settings.get();

  if (!schema || !_.isArray(schema.fields)) {
    return next();
  }

  const locationField = _.first(schema.fields.filter(f => f.field === 'location'));
  const legacy = _.get(locationField, 'legacy', null);

  if (!legacy) {
    return next();
  }

  if (legacy.tagSet) {
    legacy.tagSet = flattenLocationTagSet(legacy.tagSet, req.lang);
  }

  req.locationLegacySettings = legacy;

  next();
}
