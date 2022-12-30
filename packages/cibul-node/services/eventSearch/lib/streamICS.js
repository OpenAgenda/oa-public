'use strict';

const {
  ICSStream,
} = require('@openagenda/flat-exports');

module.exports = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/calendar',
  });

  const stream = new ICSStream({
    lang: req.lang,
    slug: req.agenda.slug,
    identifier: req.agenda.uid,
    title: req.agenda.title,
    description: req.agenda.description,
  });

  req.stream.pipe(stream).pipe(res);
};
