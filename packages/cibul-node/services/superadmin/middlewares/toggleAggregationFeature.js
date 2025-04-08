import _ from 'lodash';

export default function toggleAggregationFeature(req, res, next) {
  const { aggregators } = req.app.services;

  const isAggregatorCredentialSet = _.get(req, 'body.credentials.aggregator')
    || _.get(req, 'body.credentials.aggregator') === false;

  if (!isAggregatorCredentialSet) {
    next();
    return;
  }
  aggregators
    .set(
      req.agenda.uid,
      {
        limit: !!_.get(req, 'body.credentials.aggregator'),
      },
      { patch: true, protected: false },
    )
    .then(() => next(), next);
}
