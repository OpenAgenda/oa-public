import markdownLinkExtractor from 'markdown-link-extractor';

export default function extractLinksFromMarkdown(markdown) {
  return markdownLinkExtractor(markdown).reduce(
    ({ cursor, linksAsInMd }, link) => {
      if (link.substr(0, 7) === 'mailto:') {
        return {
          cursor: cursor + link.length,
          linksAsInMd: linksAsInMd.concat(link),
        };
      }

      const match = {
        link,
        indexFromCursor: markdown.substr(cursor).indexOf(link),
      };

      const unescapedLink = decodeURI(link);
      const unescapedIndexFromCursor = markdown
        .substr(cursor)
        .indexOf(unescapedLink);

      if (match.indexFromCursor === -1 && unescapedIndexFromCursor === -1) {
        return {
          cursor,
          linksAsInMd,
        };
      }

      if (
        match.indexFromCursor === -1
        || (unescapedIndexFromCursor !== -1
          && unescapedIndexFromCursor < match.indexFromCursor)
      ) {
        return {
          cursor: cursor + unescapedIndexFromCursor + unescapedLink.length,
          linksAsInMd: linksAsInMd.concat(unescapedLink),
        };
      }

      return {
        cursor: cursor + match.indexFromCursor + match.link.length,
        linksAsInMd: linksAsInMd.concat(link),
      };
    },
    { cursor: 0, linksAsInMd: [] },
  ).linksAsInMd;
}
