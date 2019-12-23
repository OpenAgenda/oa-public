'use strict';

const _ = require('lodash');
const VError = require('verror');

module.exports = async (req, res, next) => {
  const update = req.app.core.agendas(req.agenda.uid).events.update;

  // if there was an image uploaded with the post, it is loaded in req.file.path with multer
  if (_.get(req, 'file.path')) {
    _.set(req.parsedData, 'image.path', _.get(req, 'file.path', undefined));
  }

  try {
    const filtered = _.omit(req.parsedData, ['ownerUid', 'creatorUid']);

    const event = await update(req.event.uid, filtered, {
      partial: req.method === 'PATCH',
      batched: _parseBool(req.headers.batched || req.body.batched),
      context: {
        userUid: req.member.userUid
      },
      access: req.access
    });

    res.json({
      success: true,
      event
    });
  } catch(e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({
        errors: e.detail
      });
    } else {
      next(new VError(e, 'update error'));
    }
  }
}

function _parseBool(v) {
  return typeof v === 'string' ? v === 'true' : !!v;
}
