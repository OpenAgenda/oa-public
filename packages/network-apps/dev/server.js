import _ from 'lodash';
import express from 'express';
import webpack from 'webpack';
import webpackDevMw from 'webpack-dev-middleware';
import webpackHotMw from 'webpack-hot-middleware';
import bsTemplates from '@openagenda/bs-templates';
import Service from '../server/index.js';
import webpackConfig from './webpack.js';
import devLayout from './layout.js';

const style = bsTemplates.getCss('main');

const compiler = webpack(webpackConfig);

const dev = express();

Service.router.setLayout(devLayout);

const stories = (await import('./stories/index.js')).default.reduce(
  (carry, story) =>
    _.set(
      carry,
      story.slug,
      _.assign(story, {
        service: Service(story.config),
      }),
    ),
  {},
);

dev.use(
  webpackDevMw(compiler, {
    stats: {
      noInfo: true,
      errorDetails: true,
    },
    publicPath: '/js',
  }),
);

dev.use(webpackHotMw(compiler));

dev.get('/', (req, res) => {
  res.send(
    devLayout(
      `<div class="margin-top-lg">${_.chunk(_.keys(stories), 4)
        .map(
          (chunk) =>
            `<div class="row">${chunk
              .map(
                (slug) => `
        <div class="col-md-3">
          <div class="wsq padding-all-sm margin-all-sm">
            <label>${stories[slug].name}</label>
            <p>${stories[slug].description}</p>
            <a href="/${slug}">Open</a>
          </div>
        </div>
      `,
              )
              .join('')}</div>`,
        )
        .join('')}</div>`,
    ),
  );
});

// useful only if frontAppPath is given to service at init
dev.use(
  '/dist',
  Service.router.dist,
  (req, res) => res.send(404), // if not, unhandled files will be handled by following routes
);

dev.get('/style.css', (req, res) =>
  res.set('Content-Type', 'text/css').send(style));
dev.get('/favicon.ico', (req, res) => res.sendStatus(404));
dev.use(
  '/fonts',
  express.static(`${import.meta.dirname}/../bs-templates/templates/fonts`),
);

dev.use('/:story', (req, res, next) => {
  const story = stories[req.params.story];

  if (!story) return res.redirect(302, '/');

  Service.router.setService(story.service);

  _.assign(req, story.req);

  next();
});

dev.use('/:story', Service.router);

dev.listen(3000);
