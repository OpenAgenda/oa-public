import _ from 'lodash';
import ky from 'ky';
import mdExtractor from 'markdown-link-extractor';
import * as cheerio from 'cheerio';
import logger from '@openagenda/logs';
import linkValidator from '@openagenda/validators/link';
import validateOptions from './validators/options.js';
import validateFromMarkdownOptions from './validators/fromMarkdownOptions.js';
import injectEmbeds from './utils/injectEmbeds.js';

const log = logger('main');

const validateLink = linkValidator();

const isLink = (v) => {
  try {
    validateLink(v);
  } catch (e) {
    return false;
  }
  return true;
};

const isEmbedlessLink = (filters, link) =>
  !filters.some((filter) => filter.test(link));

function extractScript(linkData) {
  const $ = cheerio.load(linkData.html);

  const scriptElem = $('script').get(0);

  if (!scriptElem) {
    return linkData;
  }

  const script = Object.entries(scriptElem.attribs).reduce(
    (accu, [key, value]) => {
      accu[key] = value === '' ? true : value;
      return accu;
    },
    {},
  );

  $('script').remove();

  return {
    ...linkData,
    html: $('body').html(),
    script,
  };
}

export default class OEmbed {
  constructor(options) {
    try {
      if (options.logger) {
        logger.setModuleConfig(options.logger);
      }

      this.params = validateOptions(options);
      this.params.filters = (this.params.filters ?? []).map(
        (f) => new RegExp(f),
      );
    } catch (errors) {
      throw new Error('options are not valid', errors);
    }
  }

  async get(url, options = {}) {
    log('getting data for %s', url);

    try {
      const result = await ky
        .get(this.params.iframely.res, {
          searchParams: {
            api_key: this.params.iframely.key,
            url,
            lazy: options.lazy ? 1 : 0,
          },
        })
        .json();

      log('retrieved data for %s', url);

      return extractScript(result);
    } catch (err) {
      if (err?.response?.status === 417) {
        return null;
      }
      throw err;
    }
  }

  fromMarkdown(md = '', options = {}) {
    const cleanOptions = validateFromMarkdownOptions(options);

    const urls = _.uniq(mdExtractor(md)).filter((link) => {
      const unescapedLink = _.unescape(link);
      if (cleanOptions.filterInvalidLinks && !isLink(unescapedLink)) {
        return false;
      }
      if (
        !cleanOptions.includeEmbedlessLinks
        && isEmbedlessLink(this.params.filters, link)
      ) {
        return false;
      }
      return true;
    });

    return Promise.all(
      urls.map(async (url) => {
        const matchingCurrent = cleanOptions.current.find(
          (c) => c.link === url,
        );

        if (matchingCurrent) return matchingCurrent;

        const item = { link: _.unescape(url) };

        if (isEmbedlessLink(this.params.filters, url)) return item;

        try {
          item.data = await this.get(url, {
            lazy: cleanOptions.lazy,
          });
          return item;
        } catch (e) {
          log.warn('could not retrieve code for %s', url, e);
          return null;
        }
      }),
    ).then((res) => res.filter((r) => !!r));
  }

  // eslint-disable-next-line class-methods-use-this
  injectEmbeds(html, links, options) {
    return injectEmbeds(html, links, options);
  }
}
