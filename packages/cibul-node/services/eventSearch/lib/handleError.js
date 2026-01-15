import logs from '@openagenda/logs';

const log = logs('services/eventSearch/handleError');

export default (err, req, res, next) => {
  if (err?.name === 'NotAuthenticated') {
    log.warn(err);
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }
  if (err?.name === 'NotFound') {
    log.warn(err);
    return res.status(err.statusCode).send(null);
  }

  if (err?.name === 'BadRequest') {
    log.warn(err);
    return res.status(err.statusCode).json({
      error: err.info,
      requested: req.query.aggregations,
    });
  }

  log.error(err);

  if (err) {
    return res.status(500).send();
  }

  next();
};
