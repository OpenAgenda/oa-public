'use strict';

const _ = require('lodash');

module.exports = (req, res, next) => {
  // if there was an image uploaded with the post, it is loaded in req.file.path with multer
  if (_.get(req, 'file.path')) {
    _.set(req.parsedData, 'image.path', _.get(req, 'file.path', undefined));
  }

  req.app.core.agendas(req.agenda.uid).events.update(
    req.event.uid,
    _.omit(req.parsedData, ['ownerUid', 'creatorUid']),
    {
      partial: req.method === 'PATCH',
      batched: _parseBool(req.headers.batched || req.body.batched),
      context: {
        userUid: req.member.userUid
      },
      access: req.access,
      defaultLang: req.headers.lang
    }
  ).then(event => res.json({ success: true, event }), next);
}

function _parseBool(v) {
  return typeof v === 'string' ? v === 'true' : !!v;
}
