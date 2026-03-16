import validate from '@openagenda/events/lib/validate.js';
import boolQuery from '../../lib/boolQuery.js';

export default function eventValidate(req, res, next) {
  const isDraft = boolQuery(req.query.draft);

  validate(req.parsedData, {
    isDraft,
    isPatch: false,
    protected: true,
  }).then((clean) => {
    res.json({ success: true, event: clean });
  }, next);
}
