import _ from 'lodash';

export default function list(activitiesSvc, options, preQuery = {}) {
  return (req, res) => {
    const query = { ...preQuery, ...req.query };
    const listQuery = _.pick(query, ['actor', 'verb', 'object', 'target']);
    const { limit } = { limit: 20, ...options };

    const { datetimeRange, fromId } = query;

    if (datetimeRange) {
      const [afterAt, beforeAt] = datetimeRange.split('|');
      query.createdAt = {
        $lte: new Date(beforeAt),
        $gte: new Date(afterAt),
      };
    }

    const svc = options ? activitiesSvc.feed(options) : activitiesSvc;

    svc.activities
      .list(listQuery, fromId || 0, limit)
      .then((activities) => {
        res.send({ activities });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  };
}
