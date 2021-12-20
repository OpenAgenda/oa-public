'use strict';

const _ = require('lodash');
const axios = require('axios');
const mdExtractor = require('markdown-link-extractor');

const logger = require('@openagenda/logs');

const log = logger('main');

const cleanOptions = require('./validators/options');
const cleanFromMarkdownOptions = require('./validators/fromMarkdownOptions');
const injectEmbeds = require('./utils/injectEmbeds');

module.exports = class OEmbed {
  constructor(options) {
    try {
      if (options.logger) {
        logger.setModuleConfig(options.logger);
      }

      this.params = cleanOptions(options);
      this.params.filters = (this.params.filters ?? []).map(f => new RegExp(f));
    } catch (errors) {
      throw new Error('options are not valid', errors);
    }
  }

  get(url) {
    log('getting data for %s', url);

    return axios.get(this.params.iframely.res, {
      params: {
        api_key: this.params.iframely.key,
        url
      }
    }).then(r => {
      log('retrieved data for %s', url);
      return r.data;
    });
  }

  fromMarkdown(md = '', options = {}) {
    const cleanedOptions = cleanFromMarkdownOptions(options);

    const urls = cleanedOptions.includeEmbedlessLinks ? _.uniq(mdExtractor(md))
      : _.uniq(mdExtractor(md)
        .filter(link => !!this.params.filters.filter(
          filter => filter.test(link)
        ).length));

    return Promise.all(urls.map(async url => {
      const matchingCurrent = _.first(cleanedOptions.current.filter(c => c.link === url));

      if (matchingCurrent) return matchingCurrent;

      const item = { link: _.unescape(url) };

      if (!this.params.filters.some(filter => filter.test(url))) return item;

      try {
        return {
          link: _.unescape(url),
          data: await this.get(url)
        };
      } catch (e) {
        log('error', 'could not retrieve code for %s', url, e);
        return null;
      }
    })).then(res => res.filter(r => !!r));
  }

  injectEmbeds(html, links) {
    return injectEmbeds(html, links);
  }
};
