import _ from 'lodash';

export default (req, res, next) => {
  const requestedUid = _.get(req, 'query.oaq.uid', null);

  if (!requestedUid) return next();

  res.redirect(301, `/permalinks/events/${requestedUid}`);
};
