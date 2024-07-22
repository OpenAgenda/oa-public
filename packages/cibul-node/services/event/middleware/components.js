import React from 'react';
import ReactDOMServer from 'react-dom/server';
import templater from '@openagenda/cibul-templates';
import Registration from '@openagenda/registration/lib/Display.js';

function renderComponent(component, data) {
  const rendered = ReactDOMServer.renderToStaticMarkup(React.createElement(component, data));

  return rendered === '<noscript></noscript>' ? false : rendered;
}

async function _timings(v) {
  return new Promise((resolve, reject) => {
    templater('event/hours', {
      lang: v.req.lang,
      event: {
        dates: v.req.formatted.dates,
      },
    }, (err, render) => {
      if (err) return reject(err);

      v.req.formatted.timingsComponent = render;
      resolve(v);
    });
  });
}

function _registration(v) {
  v.req.formatted.registrationComponent = renderComponent(Registration, {
    value: v.req.formatted.registration.map(({ value }) => value).join(', '),
    lang: v.req.lang,
  });
}

export default async function buildComponents(req, res, next) {
  try {
    _registration({ req });
    await _timings({ req });

    next();
  } catch (err) {
    next(err);
  }
}
