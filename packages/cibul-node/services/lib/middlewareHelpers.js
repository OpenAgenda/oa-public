export function compareModifiedSince(initialTimestamp, req, res, next) {
  let timestamp = initialTimestamp;

  if (timestamp && typeof timestamp === 'object') {
    timestamp = JSON.stringify(timestamp).replace(/"/g, '');
  }

  if (timestamp && (req.headers['if-modified-since'] === timestamp)) {
    req.log.debug('marked as not modified');

    res.status(304).end();

    return;
  }

  req.log.debug('marked as fresh, setting last-modified');

  res.set('Last-Modified', timestamp);

  next();
}
