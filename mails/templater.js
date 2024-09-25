'use strict';

const path = require('node:path');
const mjml = require('mjml');
const ejs = require('ejs');
const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('mails/templater');
const cachedReadFile = require('./utils/cachedReadFile');
const defaultFormatMessage = require('./utils/defaultFormatMessage');

const mjml2html = mjml.__esModule ? mjml.default : mjml;

async function render(config, templateName, data = {}, opts = {}) {
  const templateDir = templateName
    ? path.join(config.templatesDir || '', templateName)
    : null;
  const lang = data.lang || opts.lang;

  const __ = data.__ || opts.__ || defaultFormatMessage(config, templateName, lang);

  const templateData = {
    ...data,
    lang,
    intl: config.intl[lang],
    __,
  };

  let html = null;
  let text = null;
  let subject = null;

  // Html
  if (!opts.disableHtml) {
    let rawHtml = opts.html || '';

    if (templateDir) {
      try {
        rawHtml = await cachedReadFile(
          config.cache,
          path.join(templateDir, 'index.mjml'),
        );
      } catch (e) {
        log.error(
          new VError(
            e,
            `Error rendering html of the template '${templateName}'`,
          ),
        );
      }
    }

    if (rawHtml) {
      const preHtml = ejs.render(rawHtml, templateData, {
        ...opts,
        filename: templateDir ? path.join(templateDir, 'index.mjml') : '',
      });
      const { html: renderedHtml, errors } = mjml2html(preHtml);

      if (errors && errors.length) {
        throw new VError(
          {
            info: { errors },
          },
          `Invalid MJML (template: '${templateName})'`,
        );
      }

      html = renderedHtml;
    }
  }

  // Text
  if (!opts.disableText) {
    let rawText = opts.text || '';

    if (templateDir) {
      try {
        rawText = await cachedReadFile(
          config.cache,
          path.join(templateDir, 'text.ejs'),
        );
      } catch (e) {
        log.error(
          new VError(
            e,
            `Error rendering text of the template '${templateName}'`,
          ),
        );
      }
    }

    if (rawText) {
      text = ejs.render(rawText, templateData, {
        ...opts,
        filename: templateDir ? path.join(templateDir, 'text.ejs') : '',
      });
    }
  }

  // Subject
  if (!opts.disableSubject) {
    let rawSubject = opts.subject || '';

    if (templateDir) {
      try {
        rawSubject = await cachedReadFile(
          config.cache,
          path.join(templateDir, 'subject.ejs'),
        );
      } catch (e) {
        log.error(
          new VError(
            e,
            `Error rendering subject of the template '${templateName}'`,
          ),
        );
      }
    }

    if (rawSubject) {
      subject = ejs.render(rawSubject, templateData, {
        ...opts,
        filename: templateDir ? path.join(templateDir, 'subject.ejs') : null,
      });
    }
  }

  return {
    html,
    text,
    subject,
  };
}

module.exports = render;
