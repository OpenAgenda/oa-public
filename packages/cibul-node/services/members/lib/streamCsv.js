import { pipeline } from 'node:stream';
import csv from 'fast-csv';

export default (req, res, _next) => {
  const csvFormatterStream = csv.format({
    headers: true,
    delimiter: ';',
    quote: '"',
    escape: '"',
  });

  res.once('close', () => {
    if (!req.stream.destroyed) req.stream.destroy();
  });

  pipeline(req.stream, csvFormatterStream, res, () => {});

  res.writeHead(200, {
    'Content-Type': 'text/csv',
    'icontent-disposition': `attachment; filename="${req.agenda.slug}.members.csv"`,
  });
};
