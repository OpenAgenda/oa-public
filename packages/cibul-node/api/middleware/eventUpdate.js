import _ from 'lodash';
import boolQuery from '../../lib/boolQuery.js';

const getOptions = (req, mergeWith = {}) => ({
  isPatch: req.method === 'PATCH',
  batched: boolQuery(req.headers.batched || req.body.batched),
  context: {
    userUid: req.member.userUid,
  },
  access: req.access,
  defaultLang: req.headers.lang,
  private: null,
  callOrigin: 'api',
  ...mergeWith,
});

function eventUpdate(req, res, next) {
  // if there was an image uploaded with the post, it is loaded in req.file.path with multer
  if (_.get(req, 'file.path')) {
    _.set(req.parsedData, 'image.path', _.get(req, 'file.path', undefined));
  }

  req.app.core
    .agendas(req.agenda.uid)
    .events.update(
      req.event.uid,
      _.omit(req.parsedData, ['ownerUid', 'creatorUid']),
      getOptions(req, {
        returnPayload: true,
        mergeExtIds: boolQuery(req.query.mergeExtIds, {
          defaultValue: true,
        }),
      }),
    )
    .then(({ event, times }) => {
      req.times = times;
      res.json({ success: true, event });
    }, next);
}

function eventUpdateByExtId(req, res, next) {
  req.app.core
    .agendas(req.agenda.uid)
    .events.setByExtId(
      req.params.extKey,
      req.params.extId,
      req.parsedData,
      getOptions(req),
    )
    .then((event) => res.json(event), next);
}

export default Object.assign(eventUpdate, {
  byExtId: eventUpdateByExtId,
});
