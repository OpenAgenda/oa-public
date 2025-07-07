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
  if (
    input.substr(index + link.length, 1) === ')'
    && input.substr(index - 2, 2) === ']('
  ) {
    return true;
  }

  // Check if the link is already inside the URL part of a markdown link
  // Look backwards to find if we're inside a ](...) structure
  let searchIndex = index - 1;
  let foundClosingBracket = false;
  let foundOpeningParen = false;

  while (searchIndex >= 0) {
    const char = input.charAt(searchIndex);

    if (char === ')' && !foundClosingBracket) {
      // We're looking for the structure, but if we hit a closing paren first,
      // we're not inside a markdown link URL
      break;
    }

    if (char === '(' && !foundOpeningParen) {
      foundOpeningParen = true;
      searchIndex -= 1;
      continue;
    }

    if (foundOpeningParen && char === ']') {
      foundClosingBracket = true;
      // Check if there's a '[' before this ']'
      let bracketSearchIndex = searchIndex - 1;
      let bracketDepth = 1;

      while (bracketSearchIndex >= 0 && bracketDepth > 0) {
        const bracketChar = input.charAt(bracketSearchIndex);
        if (bracketChar === ']') {
          bracketDepth += 1;
        } else if (bracketChar === '[') {
          bracketDepth -= 1;
        }
        bracketSearchIndex -= 1;
      }

      if (bracketDepth === 0) {
        // We found a complete markdown link structure and our link is inside the URL part
        return true;
      }
      break;
    }

    searchIndex -= 1;
  }

  // Additional check: Look forward from the link to see if we're inside a markdown link's text part
  // This handles cases like [**https://google.fr**](https://google.fr)
  let forwardIndex = index + link.length;
  let foundFormattingEnd = false;

  // Skip over markdown formatting characters after the link
  while (forwardIndex < input.length) {
    const char = input.charAt(forwardIndex);
    if (char === '*' || char === '_') {
      foundFormattingEnd = true;
      forwardIndex += 1;
      continue;
    }
    break;
  }

  // If we found formatting and then a closing bracket followed by opening paren
  if (
    foundFormattingEnd
    && forwardIndex < input.length
    && input.charAt(forwardIndex) === ']'
    && forwardIndex + 1 < input.length
    && input.charAt(forwardIndex + 1) === '('
  ) {
    // Look backwards from our link to find the opening bracket
    let backwardIndex = index - 1;

    // Skip over markdown formatting characters before the link
    while (backwardIndex >= 0) {
      const char = input.charAt(backwardIndex);
      if (char === '*' || char === '_') {
        backwardIndex -= 1;
        continue;
      }
      break;
    }

    // Check if we find the opening bracket
    if (backwardIndex >= 0 && input.charAt(backwardIndex) === '[') {
      return true;
    }
  }

  return false;
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
