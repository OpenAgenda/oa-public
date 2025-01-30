import templater from '@openagenda/cibul-templates';

async function _timings(v) {
  return new Promise((resolve, reject) => {
    templater(
      'event/hours',
      {
        lang: v.req.lang,
        event: {
          dates: v.req.formatted.dates,
        },
      },
      (err, render) => {
        if (err) return reject(err);

        v.req.formatted.timingsComponent = render;
        resolve(v);
      },
    );
  });
}

export default async function buildComponents(req, res, next) {
  try {
    await _timings({ req });

    next();
  } catch (err) {
    next(err);
  }
}
