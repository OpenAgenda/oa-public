'use strict';

const planer = require('planer');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');

const turndownService = new TurndownService({ headingStyle: 'atx' });
const dom = new JSDOM('', {
  FetchExternalResources: false,
  ProcessExternalResources: false,
}).window.document;

module.exports = reqBody => {
  const body = planer.extractFrom(reqBody['stripped-html'], 'text/html', dom);
  return turndownService.turndown(body);
};
