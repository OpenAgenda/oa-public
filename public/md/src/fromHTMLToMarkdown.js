import turndown from 'turndown';
import markdownLinkExtractor from 'markdown-link-extractor';

const TurndownService = turndown.default || turndown;
const ts = new TurndownService();

ts.addRule('line', {
  filter: ['p'],
  replacement: content => [content, '\n'].join(''),
});

function wasProtocolAdded(link, context) {
  if (link.indexOf('http') !== 0) {
    return false;
  }

  if (context.indexOf(link) !== -1) {
    return false;
  }

  return context.indexOf(link.replace(/^http:\/\//, '')) !== -1;
}

function extractLinkAsInInput(link, context) {
  const linkAsInInput = link.replace(/^mailto:/, '');

  if (!wasProtocolAdded(link, context)) {
    return linkAsInInput;
  }

  return linkAsInInput.replace(/^http:\/\//, '');
}

function convertTextLinks(markdownInput) {
  return markdownLinkExtractor(markdownInput).reduce(({ md, cursor }, link) => {
    const unescapedLink = decodeURI(link);

    const linkAsInInput = extractLinkAsInInput(unescapedLink, md);
    const index = md.indexOf(linkAsInInput, cursor);
    const isMarkdownLink = (index > 2)
      && (md.substr(index + unescapedLink.length, 1) === ')')
      && (md.substr(index - 2, 2) === '](');

    if (isMarkdownLink) {
      return {
        md,
        cursor: index + 1,
      };
    }

    const before = md.substr(0, index);
    const after = md.substr(index + linkAsInInput.length);

    const markdownedLink = `[${linkAsInInput}](${unescapedLink.replace(/\\/g, '')})`;
    return {
      md: before + markdownedLink + after,
      cursor: index + markdownedLink.length,
    };
  }, { md: markdownInput, cursor: 0 }).md;
}

export default function fromHTMLToMarkdown(HTML) {
  return convertTextLinks(ts.turndown(HTML || ''));
}
