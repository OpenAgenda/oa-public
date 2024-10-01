import planer from 'planer';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const turndownService = new TurndownService({ headingStyle: 'atx' });
const dom = new JSDOM('', {
  FetchExternalResources: false,
  ProcessExternalResources: false,
}).window.document;

export default (reqBody) => {
  const body = planer.extractFrom(reqBody['stripped-html'], 'text/html', dom);
  return turndownService.turndown(body);
};
