'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mjml = require('mjml');
const ejs = require('ejs');
const VError = require('verror');
const log = require('@openagenda/logs')('mails/templater');

const mjml2html = mjml.__esModule ? mjml.default : mjml;
const readFile = promisify(fs.readFile);

async function render(config, templateName, data = {}, opts = {}) {
  const templateDir = templateName ? path.join(config.templatesDir || '', templateName) : null;
  const lang = data.lang || opts.lang;

  let __ = data.__ || opts.__;
  if (!__) {
    const labels = (config.translations.labels || {})[templateName] || {};
    __ = config.translations.makeLabelGetter(labels, lang);
  }

  const templateData = {
    ...data,
    lang,
    __
  };

  let html = opts.html || null;
  let text = opts.text || null;
  let subject = opts.subject || null;

  // Html
  if (!opts.disableHtml) {
    try {
      if (templateDir) {
        const rawHtml = await readFile(path.join(templateDir, 'index.mjml'), 'utf8');

        const preHtml = ejs.render(rawHtml, templateData, {
          ...opts,
          filename: path.join(
            config.templatesDir || '',
            templateName,
            'index.mjml'
          )
        });
        const { html: renderedHtml, errors } = mjml2html(preHtml);

        if (errors && errors.length) {
          throw new VError(
            {
              info: { errors }
            },
            `Error rendering html of the template '${templateName}'`
          );
        }

        html = renderedHtml;
      }
    } catch (e) {
      log.error(
        new VError(
          e,
          `Error rendering html of the template '${templateName}'`
        )
      );
    }
  }

  // Text
  if (!opts.disableText) {
    try {
      const rawText = await readFile(path.join(templateDir, 'text.ejs'), 'utf8');

      text = ejs.render(rawText, templateData, {
        ...opts,
        filename: path.join(config.templatesDir || '', templateName, 'text.ejs')
      });
    } catch (e) {
      log.error(
        new VError(
          e,
          `Error rendering text of the template '${templateName}'`
        )
      );
    }
  }

  // Subject
  if (!opts.disableSubject) {
    try {
      const rawSubject = await readFile(
        path.join(templateDir, 'subject.ejs'),
        'utf8'
      );

      subject = ejs.render(rawSubject, templateData, {
        ...opts,
        filename: path.join(
          config.templatesDir || '',
          templateName,
          'subject.ejs'
        )
      });
    } catch (e) {
      log.error(
        new VError(
          e,
          `Error rendering subject of the template '${templateName}'`
        )
      );
    }
  }

  return {
    html,
    text,
    subject
  };
}

module.exports = render;
