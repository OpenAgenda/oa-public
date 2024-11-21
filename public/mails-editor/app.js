import fs from 'node:fs';
import path from 'node:path';
import { URL, URLSearchParams } from 'node:url';
import _ from 'lodash';
import express from 'express';
import morgan from 'morgan';
import reload from 'reload';
import walk from 'walk';
import htmlToText from 'html-to-text';
import VError from '@openagenda/verror';

function recursiveListPaths(base, type, filters) {
  const walker = walk.walk(base, {
    followLinks: false,
    filters: [
      'node_modules',
      '.git',
      ...Array.isArray(filters) ? filters : [filters],
    ],
  });

  const paths = [];

  walker.on(type, (root, stat, next) => {
    paths.push(`${root.replace(base, '')}/${stat.name}`);
    next();
  });

  return new Promise((resolve) => walker.on('end', () => resolve(paths)));
}

function getLangsFromTemplateDir(templateDir) {
  const localesDir = path.join(templateDir, 'locales');

  if (fs.existsSync(localesDir)) {
    return fs
      .readdirSync(localesDir)
      .map((v) => path.parse(v).name)
      .filter((lang) => lang !== 'io');
  }

  return [];
}

function renderLangsList(langs, query) {
  return [
    '<ul style="text-align: center; padding-left: 0">',
    '<b>Language</b><br />',
    langs
      .map((l) => {
        const searchParams = new URLSearchParams(query);
        searchParams.set('lang', l);

        return `<li style="display: inline"><a href="?${searchParams}">${l}</a></li>`;
      })
      .join('&nbsp;&nbsp;'),
    '</ul>',
  ].join('');
}

function renderFixturesList(paths, query) {
  return [
    '<ul style="text-align: center; padding-left: 0">',
    '<b>Fixtures</b><br />',
    paths
      .map((p) => {
        const searchParams = new URLSearchParams(query);
        searchParams.set('fixtures', p.slice(1));

        return `<li style="display: inline"><a href="?${searchParams}">${p.slice(
          1,
        )}</a></li>`;
      })
      .join('&nbsp;&nbsp;'),
    '</ul>',
  ].join('');
}

function withReload(html) {
  return html.replace(
    '</body>',
    '<script src="/reload/reload.js"></script></body>',
  );
}

export default async function createApp(mails) {
  const app = express();

  app.use(
    morgan('dev', {
      skip: (req) => ['/reload/reload.js', '/robots.txt'].includes(req.path),
    }),
  );

  app.get('/', async (req, res, next) => {
    try {
      const paths = (
        await recursiveListPaths(
          mails.config.templatesDir,
          'directory',
          /^((?!fixtures).)*$/,
        )
      ).filter((filepath) =>
        fs.existsSync(
          path.join(mails.config.templatesDir, filepath, 'index.mjml'),
        ));

      res.send(
        [
          '<html>',
          '<head><title>Mails Editor 🎉</title></head>',
          '<body>',
          '<h1>Templates list</h1>',
          '<ul>',
          paths.map((p) => `<li><a href="${p}.mjml">${p}</a></li>`).join(''),
          '</ul>',
          '</body>',
          '</html>',
        ].join(''),
      );
    } catch (err) {
      return next(err);
    }
  });

  app.get(/.mjml$/, async (req, res, next) => {
    if (req.path.includes('reload/reload.js')) {
      return next();
    }

    const templateName = req.path.slice(1, -5);
    const templateDir = path.join(mails.config.templatesDir, templateName);
    const fixturesDir = path.join(templateDir, 'fixtures');
    let fixturesPaths = [];
    let data;

    if (fs.existsSync(fixturesDir) && fs.lstatSync(fixturesDir).isDirectory()) {
      fixturesPaths = await recursiveListPaths(fixturesDir, 'file');
    }

    try {
      if (fixturesPaths.length) {
        data = (
          await import(
            path.join(fixturesDir, req.query.fixtures || fixturesPaths[0])
          )
        ).default;
      } else {
        data = (await import(path.join(templateDir, 'fixtures.js'))).default;
      }
    } catch (e) {
      console.log(`No fixtures for the template ${templateName}`);
      data = {};
    }

    Object.assign(data, mails.config.defaults.data);

    const langs = getLangsFromTemplateDir(templateDir);
    const lang = req.query.lang || mails.config.defaults.lang || langs[0];

    let html;
    let text;
    let subject;
    try {
      ({ html, text, subject } = await mails.render(templateName, data, {
        lang,
      }));
    } catch (error) {
      return next(error);
    }

    switch (req.query.raw) {
      case 'html': {
        return res.send(req.query.ignoreReload ? html : withReload(html));
      }
      case 'text': {
        const textPage = `<html><body><pre>${_.escape(text)}</pre></body></html>`;
        return res.send(
          req.query.ignoreReload ? textPage : withReload(textPage),
        );
      }
      case 'subject': {
        const subjectPage = `<html><body>${subject}</body></html>`;
        return res.send(
          req.query.ignoreReload ? subjectPage : withReload(subjectPage),
        );
      }
      default:
    }

    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const getRawUrl = (type) => {
      const url = new URL(baseUrl);
      url.searchParams.set('raw', type);
      return url;
    };
    const iframeSrc = getRawUrl('html');
    iframeSrc.searchParams.set('ignoreReload', '1');

    const preview = htmlToText
      .fromString(html, { ignoreHref: true, ignoreImage: true })
      .trim()
      .slice(0, 160)
      .replace(/\n/g, ' ');

    const initialHtml = [
      '<html lang="en" class="notranslate" translate="no">',
      '<head>',
      '  <title>Mails Editor 🎉</title>',
      '  <meta name="google" content="notranslate" />',
      '</head>',
      '<body style="margin: 0">',
      '<script>',
      '  function resizeIframe(obj) {',
      "    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';",
      '    setTimeout(() => resizeIframe(obj), 32)',
      '  }',
      '</script>',
      ...langs.length
        ? [renderLangsList(langs, req.query), '<hr style="max-width: 600px" />']
        : [],
      ...fixturesPaths.length
        ? [
          renderFixturesList(fixturesPaths, req.query),
          '<hr style="max-width: 600px" />',
        ]
        : [],
      ...subject !== null
        ? [
          `<div style="text-align: center"><b>Subject <small>(<a href="${getRawUrl(
            'subject',
          )}">raw</a>)</small>:</b>`,
          subject,
          `<p><small>${preview}</small></p>`,
          '</div>',
          '<hr style="max-width: 600px" />',
        ]
        : [],
      '<div style="display: flex">',
      '<div style="margin: 0 auto">',
      `<h2 style="text-align: center">Html version <small>(<a href="${getRawUrl(
        'html',
      )}">raw</a>)</small></h2>`,
      `<iframe src="${iframeSrc}" frameborder="0" scrolling="no" width="600px" onload="resizeIframe(this)">`,
      '</iframe>',
      '</div>',
      ...text !== null
        ? [
          '<div style="margin: 0 auto">',
          `<h2 style="text-align: center">Text version <small>(<a href="${getRawUrl(
            'text',
          )}">raw</a>)</small></h2>`,
          `<div style="max-width: 600px; margin: 0 auto;">${_.escape(
            text,
          ).replace(/(?:\r\n|\r|\n)/g, '<br>')}</div>`,
          '</div>',
        ]
        : [],
      '</div></body></html>',
    ].join('');

    res.send(withReload(initialHtml));
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);

    if (res.headersSent) {
      return next(err);
    }

    const content = err instanceof VError ? JSON.stringify(err, null, 2) : err.toString();
    const html = `<html><body>${_.escape(content)}</body></html>`;

    res.status(500).send(withReload(html));
  });

  await reload(app);

  return app;
}
