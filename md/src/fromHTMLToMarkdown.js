import turndown from 'turndown';
import convertTextLinks from './utils/convertTextLinks.js';

const TurndownService = turndown.default || turndown;
const ts = new TurndownService();

export default function fromHTMLToMarkdown(HTML) {
  return convertTextLinks(ts.turndown(HTML || ''));
}
