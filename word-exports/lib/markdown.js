import { remark } from 'remark';
import { hyperlinkRuns, paragraph, run } from './xml.js';
import { safeUrl } from './links.js';
import { HEADING_LEVELS } from './styles.js';

// Markdown (an event's long description) as Word paragraphs: headings,
// paragraphs, lists, quotes, bold, italic and links. Headings start at
// `headingOffset + 1`, under the document's own. Pictures and raw HTML keep
// their text only.

function inline(writer, nodes, marks = {}) {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'inlineCode':
          return run(node.value, marks);
        case 'strong':
          return inline(writer, node.children, { ...marks, bold: true });
        case 'emphasis':
          return inline(writer, node.children, { ...marks, italic: true });
        case 'delete':
          return inline(writer, node.children, marks);
        case 'break':
          return '<w:r><w:br/></w:r>';
        case 'link': {
          // The link text keeps its own formatting, and the one around it.
          const href = safeUrl(node.url);
          const content = node.children.length
            ? node.children
            : [{ type: 'text', value: node.url }];

          if (!href) return inline(writer, content, marks);

          return hyperlinkRuns(
            writer.link(href),
            inline(writer, content, { ...marks, style: 'Hyperlink' }),
          );
        }
        case 'image':
          return node.alt ? run(node.alt, marks) : '';
        case 'html':
          return run(node.value.replace(/<[^>]*>/g, ''), marks);
        default:
          return node.children ? inline(writer, node.children, marks) : '';
      }
    })
    .join('');
}

function blocks(writer, nodes, context) {
  return nodes.flatMap((node) => {
    switch (node.type) {
      case 'heading':
        return paragraph(inline(writer, node.children), {
          style: `Heading${Math.min(node.depth + context.headingOffset, HEADING_LEVELS)}`,
        });
      case 'paragraph':
        return paragraph(
          [
            context.prefix ? run(context.prefix) : '',
            inline(writer, node.children),
          ],
          { style: context.style },
        );
      case 'list':
        return node.children.flatMap((item, index) => {
          const marker = node.ordered ? `${(node.start ?? 1) + index}. ` : '• ';

          // The marker goes on the item's first paragraph only.
          return item.children.flatMap((child, childIndex) =>
            blocks(writer, [child], {
              ...context,
              style: 'ListItem',
              prefix: childIndex === 0 ? marker : null,
            }));
        });
      case 'blockquote':
        return blocks(writer, node.children, { ...context, style: 'Quote' });
      case 'code':
        return paragraph(run(node.value), { style: context.style });
      case 'html': {
        const text = node.value.replace(/<[^>]*>/g, '').trim();

        return text ? paragraph(run(text), { style: context.style }) : [];
      }
      case 'thematicBreak':
        return paragraph('');
      default:
        return node.children ? blocks(writer, node.children, context) : [];
    }
  });
}

export default function markdownParagraphs(
  writer,
  markdown,
  { headingOffset = 1 } = {},
) {
  if (!markdown) return '';

  return blocks(writer, remark().parse(markdown).children, {
    headingOffset,
    style: null,
    prefix: null,
  }).join('');
}
