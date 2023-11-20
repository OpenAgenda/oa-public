'use strict';

module.exports = function streamPDF(req, res) {
  const {
    services: {
      pdfExports,
    },
  } = req.app;

  pdfExports.GenerateExportStream(req.stream, res, {
    agenda: req.agenda,
  });

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.pdf"`,
  });
};
