import extractLinkAsInMarkdown from './extractLinksAsInMarkdown.js';

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

function isMarkdownLink(input, refIndex, link) {
  let index = refIndex;
  if (index < 1) {
    return false;
  }

  // [ignore this](...)
  if (
    input.substr(index + link.length, 1) === ']'
    && input.substr(index - 1, 1) === '['
  ) {
    index += link.length + 2;
  }

  if (index <= 2) {
    return false;
  }

  // [...](ishere)
  return (
    input.substr(index + link.length, 1) === ')'
    && input.substr(index - 2, 2) === ']('
  );
}

export default function convertTextLinks(markdownInput) {
  return extractLinkAsInMarkdown(markdownInput).reduce(
    ({ md, cursor }, link) => {
      const unescapedLink = decodeURI(link);

      const linkAsInInput = extractLinkAsInInput(link, md);
      const unprefixedLink = unescapedLink.replace(/^mailto:/, '');

      const index = md.indexOf(linkAsInInput, cursor);

      if (isMarkdownLink(md, index, linkAsInInput, unescapedLink)) {
        return {
          md,
          cursor: index + 1,
        };
      }

      const before = md.substr(0, index);
      const after = md.substr(index + linkAsInInput.length);

      const markdownedLink = `[${unprefixedLink}](${unescapedLink.replace(/\\/g, '')})`;
      return {
        md: before + markdownedLink + after,
        cursor: index + markdownedLink.length,
      };
    },
    { md: markdownInput, cursor: 0 },
  ).md;
}
