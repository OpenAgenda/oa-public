import csv from 'fast-csv';

export default (req, res, _next) => {
  const csvFormatterStream = csv.format({
    headers: true,
    delimiter: ';',
    quote: '"',
    escape: '"',
  });

  req.stream.pipe(csvFormatterStream).pipe(res);

  res.writeHead(200, {
    'Content-Type': 'text/csv',
    'icontent-disposition': `attachment; filename="${req.agenda.slug}.members.csv"`,
  });
};
