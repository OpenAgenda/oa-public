import logs from '@openagenda/logs';

const log = logs('services/eventSearch/handleError');

export default (err, req, res, next) => {
  log('error', err);
  if (err?.name === 'NotAuthenticated') {
    return res.status(err.code).json({
      message: err.message,
    });
  }
  if (err?.name === 'NotFound') {
    return res.status(err.code).send(null);
  }

  if (err?.name === 'BadRequest') {
    return res.status(err.code).json({
      error: err.info,
      requested: req.query.aggregations,
    });
  }

  if (err) {
    return res.status(500).send();
  }

  next();
};
