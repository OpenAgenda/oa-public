import { remark } from 'remark';
import { decodeHTML } from 'entities';
import { hyperlinkRuns, paragraph, run } from './xml.js';
import { safeUrl } from './links.js';
import { HEADING_LEVELS } from './styles.js';

// Markdown (an event's long description) as Word paragraphs: headings,
// paragraphs, lists, quotes, bold, italic and links, inline or by reference.
// Headings start at `headingOffset + 1`, under the document's own. Pictures
// keep their text only. Raw HTML, common in imported descriptions, is read as
// text: its line breaks and paragraphs kept, its entities decoded.

const LINE_BREAK = '<w:r><w:br/></w:r>';

// HTML as lines of text: a `<br>` or the end of a block element is a line
// break, a blank line or a `</p>` a new paragraph.
export function htmlParagraphs(html) {
  return decodeHTML(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]*>/g, ''),
  )
    .split(/\n\s*\n/)
    .map((block) => block.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);
}

function inline(writer, nodes, marks, context) {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'inlineCode':
          return run(node.value, marks);
        case 'strong':
          return inline(
            writer,
            node.children,
            { ...marks, bold: true },
            context,
          );
        case 'emphasis':
          return inline(
            writer,
            node.children,
            { ...marks, italic: true },
            context,
          );
        case 'delete':
          return inline(writer, node.children, marks, context);
        case 'break':
          return LINE_BREAK;
        case 'link':
        case 'linkReference': {
          const url = node.type === 'link'
            ? node.url
            : context.definitions.get(node.identifier);
          // The link text keeps its own formatting, and the one around it.
          const content = node.children.length
            ? node.children
            : [{ type: 'text', value: url ?? '' }];
          const href = url && safeUrl(url);

          if (!href) return inline(writer, content, marks, context);

          return hyperlinkRuns(
            writer.link(href),
            inline(writer, content, { ...marks, style: 'Hyperlink' }, context),
          );
        }
        case 'image':
        case 'imageReference':
          return node.alt ? run(node.alt, marks) : '';
        case 'html':
          // Inline, a tag alone: a `<br>` breaks the line, the others go.
          return /^<br\s*\/?>$/i.test(node.value.trim())
            ? LINE_BREAK
            : run(decodeHTML(node.value.replace(/<[^>]*>/g, '')), marks);
        default:
          return node.children
            ? inline(writer, node.children, marks, context)
            : '';
      }
    })
    .join('');
}

// Puts a list marker at the start of the first paragraph of `xml`, after its
// properties: the item's first block carries it, whatever its kind.
function withMarker(xml, marker) {
  return xml.replace(
    /^<w:p>(<w:pPr>.*?<\/w:pPr>)?/,
    (start) => `${start}${run(marker)}`,
  );
}

function blocks(writer, nodes, context) {
  return nodes.flatMap((node) => {
    switch (node.type) {
      case 'heading':
        return paragraph(inline(writer, node.children, {}, context), {
          style: `Heading${Math.min(node.depth + context.headingOffset, HEADING_LEVELS)}`,
        });
      case 'paragraph':
        return paragraph(inline(writer, node.children, {}, context), {
          style: context.style,
        });
      case 'list':
        return node.children.map((item, index) => {
          const marker = node.ordered ? `${(node.start ?? 1) + index}. ` : '• ';

          return withMarker(
            blocks(writer, item.children, {
              ...context,
              style: 'ListItem',
            }).join(''),
            marker,
          );
        });
      case 'blockquote':
        return blocks(writer, node.children, { ...context, style: 'Quote' });
      case 'code':
        return paragraph(run(node.value), { style: context.style });
      case 'html':
        return htmlParagraphs(node.value).map((text) =>
          paragraph(run(text), { style: context.style }));
      case 'thematicBreak':
        return paragraph('');
      case 'definition':
        return [];
      default:
        return node.children ? blocks(writer, node.children, context) : [];
    }
  });
}

function collectDefinitions(node, definitions = new Map()) {
  if (node.type === 'definition') definitions.set(node.identifier, node.url);

  (node.children ?? []).forEach((child) =>
    collectDefinitions(child, definitions));

  return definitions;
}

export default function markdownParagraphs(
  writer,
  markdown,
  { headingOffset = 1 } = {},
) {
  if (!markdown) return '';

  const tree = remark().parse(markdown);

  return blocks(writer, tree.children, {
    headingOffset,
    style: null,
    definitions: collectDefinitions(tree),
  }).join('');
}
