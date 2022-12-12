'use strict';

const log = require('@openagenda/logs')('services/eventSearch/JSONResponse');

function JSONResponse(req, res) {
  req.search(
    req.searchQuery,
    req.query,
    req.searchOptions,
  ).then(
    result => res.json(result),
    err => {
      if (err.name === 'NotFound') {
        return res.status(404).send(null);
      }
      if (err.name === 'BadRequest') {
        return res.status(400).json({
          message: err.message,
          info: err.info,
        });
      }
      log('error', err?.meta?.body?.error ?? err);
      res.status(500).send();
    },
  );
}

async function streamResponse(req, res) {
  res.set({
    'Content-Type': 'application/json',
    'Content-disposition': `inline; filename="${req.agenda.slug}.agenda.json"`,
  });

  let isFirst = true;

  for await (const event of req.stream) {
    if (!isFirst) {
      res.write(',');
    } else {
      res.write(`{"total": ${req.stream._total},"events":[`);
      isFirst = false;
    }

    res.write(JSON.stringify(event));
  }

  res.write(']}');

  return res.end();
}

module.exports = Object.assign(JSONResponse, {
  streamResponse,
});
