'use strict';

const flatExports = require('@openagenda/flat-exports');
const labels = require('@openagenda/labels/event/exportFieldNames');

const xlsx = flatExports.xlsx();

module.exports = (req, res) => {
  xlsx(req.stream, {
    lang: req.lang,
    languages: req.languages,
    labels
  }).pipe(res);

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.xlsx"`
  });
};
