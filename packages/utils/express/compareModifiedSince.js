'use strict';

module.exports = ts => (req, res, next) => {
  const timestamp = ts && typeof ts === 'object' ? JSON.stringify(ts).replace(/"/g, '') : ts;

  if (timestamp && (req.headers[ 'if-modified-since' ] === timestamp)) {
    req.log && req.log.debug('marked as not modifed');
    res.status(304).end();
    return;
  }

  req.log && req.log.debug('marked as fresh, setting last-modified');

  res.set('Last-Modified', timestamp);

  next();
}
