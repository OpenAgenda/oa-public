import _ from 'lodash';
import logs from '@openagenda/logs';
import { remark } from 'remark';
import Cursor from './Cursor.js';
import addText from './addText.js';
import adjustSize from './adjustSize.js';

const log = logs('addMarkdownSegment');

function extractText(element) {
  if (element.type === 'text') {
    return element.value;
  }
  if (element.children) {
    return element.children.map(extractText).join(' ');
  }
  return '';
}

function addImageElement(doc, cursor, element, params) {
  return addText(doc, cursor, {
    ...params,
    content: element.url,
    link: element.url,
    underline: element.type === 'link' ? true : undefined,
  });
}

async function addDefaultElement(doc, cursor, element, params) {
  const content = extractText(element);
  const link = element.url || params.url;
  const size = await addText(doc, cursor, {
    ...params,
    value: `${params.prefix ?? ''}${content}`,
    link,
    underline: !!link,
  });
  log('addDefaultElement - added', {
    cursor: _.pick(cursor, ['x', 'y']),
    type: element.type,
    content,
    size,
    simulate: !!params.simulate,
  });
  return size;
}

async function addMarkdownElement(doc, parentCursor, element, params) {
  const cursor = Cursor(parentCursor);

  log('  addMarkdownElement of type %s', element.type);

  if (element.children) {
    const size = { width: 0, height: 0 };
    for (const [index, child] of element.children.entries()) {
      const elementChildSize = await addMarkdownElement(doc, cursor, child, {
        ...params,
        ...element.type === 'heading' && { bold: true },
        ...element.type === 'listItem' && {
          prefix: element.ordered ? `${index}. ` : '• ',
        },
        ...element.type === 'link' && { url: element.url },
      });
      adjustSize(size, elementChildSize);
      cursor.moveY(elementChildSize.height);
    }
    return size;
  }

  if (['text', 'link'].includes(element.type)) {
    return addDefaultElement(doc, cursor, element, params);
  }

  if (element.type === 'image') {
    return addImageElement(doc, cursor, element, params);
  }

  return { width: 0, height: 0 };
}

export default async function addMarkdownSegment(
  doc,
  parentCursor,
  params = {},
) {
  const { value, availableWidth = doc.page.width - parentCursor.x } = params;

  const cursor = Cursor(parentCursor);

  const parsedMarkdown = remark().parse(value);

  const size = { height: 0, width: 0 };

  for (const [index, element] of parsedMarkdown.children.entries()) {
    log('addMarkdownSegment', { index });
    const markdownElementSize = await addMarkdownElement(doc, cursor, element, {
      ...params,
      availableWidth,
    });

    adjustSize(size, markdownElementSize);

    cursor.moveY(markdownElementSize.height);

    log('addMarkdownSegment: moved cursor y to %s', cursor.y);
  }

  return size;
}
