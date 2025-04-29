// import logs from '@openagenda/logs';

// const log = logs('api/middleware/loadEventPDF');
const isDev = process.env.NODE_ENV === 'development';

function cleanImages({ event, agenda, app }) {
  const clean = {
    event,
    agenda,
  };

  const config = app.services.core.getConfig();

  if (event.image?.filename) {
    clean.event = {
      ...event,
      image: {
        ...event.image,
        base: isDev
          ? event.image.base
          : event.image.base.replace('dev', 'main'),
      },
    };
  }

  if (agenda.image) {
    clean.agenda = {
      ...agenda,
      image: isDev ? agenda.image : agenda.image.replace('dev', 'main'),
    };
  }

  if (event.location?.image) {
    const locationImage = `${config.s3.mainBucketPath}${event.location.image}`;
    clean.event.location = {
      ...event.location,
      image: isDev ? locationImage.replace('dev', 'main') : locationImage,
    };
  }

  return clean;
}

export default function loadEventPDF(req, res, next) {
  const {
    services: { pdfExports },
  } = req.app;

  const { agenda, event } = cleanImages(req);

  try {
    pdfExports.event.render(res, agenda, event, {
      lang: req.lang,
    });
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-disposition': `attachment; filename="${req.agenda.slug}.${req.event.slug}.pdf"`,
    });
  } catch (e) {
    next(e);
  }
}
