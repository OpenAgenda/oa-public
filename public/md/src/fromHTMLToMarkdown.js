import turndown from 'turndown';
import convertTextLinks from './utils/convertTextLinks.js';

const TurndownService = turndown.default || turndown;
const ts = new TurndownService();

ts.addRule('line', {
  filter: ['p'],
  replacement: content => [content, '\n'].join(''),
});

export default function fromHTMLToMarkdown(HTML) {
  return convertTextLinks(ts.turndown(HTML || ''));
}
