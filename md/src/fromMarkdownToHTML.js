import { Marked, marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

function extractDomain(url = '') {
  const parts = url
    .split('?')
    .shift()
    .replace(/^http(s|):\/\//, '')
    .split('/');
  return parts.shift();
}

function isSelfDomain(domain, link) {
  if (link[0] === '/' && link[1] !== '/') {
    return true;
  }

  return extractDomain(link) === domain.split('//').pop();
}

export default function fromMarkdownToHTML(md, options = {}) {
  const { selfDomain = null } = options;

  const markedWithRenderer = selfDomain
    ? new Marked({
      renderer: {
        link(href, title, text) {
          return `<a href="${href}" ${isSelfDomain(selfDomain, href) ? '' : 'target="_blank"'}>${text}</a>`;
        },
      },
    })
    : undefined;

  const HTML = (md || '')
    .split('\n\n')
    .map((markdown) =>
      (selfDomain
        ? markedWithRenderer.parse(markdown, { breaks: true })
        : marked(markdown, { breaks: true })))
    .join('<p></p>\n');

  return DOMPurify.sanitize(HTML, {
    ADD_ATTR: ['target'],
  });
}
