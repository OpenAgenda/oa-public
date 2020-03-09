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
  const templateDir = path.join(config.templatesDir || '', templateName);
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

  let rawHtml = null;
  let rawText = null;
  let rawSubject = null;
  let html = null;
  let text = null;
  let subject = null;

  // Html
  if (!opts.disableHtml) {
    if (rawHtml === null) {
      try {
        rawHtml = await readFile(path.join(templateDir, 'index.mjml'), 'utf8');
      } catch (e) {
        log.error(
          new VError(
            e,
            `Error rendering html of the template '${templateName}'`
          )
        );
      }
    }

    if (rawHtml !== null) {
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
          'Invalid MJML'
        );
      }

      html = renderedHtml;
    }
  }

  // Text
  if (!opts.disableText) {
    if (rawText === null) {
      try {
        rawText = await readFile(path.join(templateDir, 'text.ejs'), 'utf8');
      } catch (e) {
        log.error(
          new VError(
            e,
            `Error rendering text of the template '${templateName}'`
          )
        );
      }
    }

    if (rawText !== null) {
      text = ejs.render(rawText, templateData, {
        ...opts,
        filename: path.join(config.templatesDir || '', templateName, 'text.ejs')
      });
    }
  }

  // Subject
  if (!opts.disableSubject) {
    if (rawSubject === null) {
      try {
        rawSubject = await readFile(
          path.join(templateDir, 'subject.ejs'),
          'utf8'
        );
      } catch (e) {
        log.error(
          new VError(
            e,
            `Error rendering subject of the template '${templateName}'`
          )
        );
      }
    }

    if (rawSubject !== null) {
      subject = ejs.render(rawSubject, templateData, {
        ...opts,
        filename: path.join(
          config.templatesDir || '',
          templateName,
          'subject.ejs'
        )
      });
    }
  }

  return {
    html,
    text,
    subject
  };
}

module.exports = render;
