import marked from 'marked';
import sanitizeHtml from 'sanitize-html';

export default function markdownToHtml(md) {
  return sanitizeHtml(marked(md || '', { breaks: true }), {
    allowedTags: false,
    allowedAttributes: {
      h1: [],
      a: ['href'],
    },
  });
}
