import { remark } from 'remark';
import addText from './addText.js';

function extractText(element) {
  if (element.type === 'text') {
    return element.value;
  }
  if (element.children) {
    return element.children.map(extractText).join(' ');
  }
  return '';
}

async function processMarkdownElement(
  doc,
  cursor,
  element,
  options,
  listPrefix = '',
) {
  let totalHeight = 0;
  let totalWidth = 0;

  if (element.type === 'list') {
    let index = 1;

    for (const listItem of element.children) {
      const itemPrefix = element.ordered ? `${index}/ ` : '• ';
      const { height, width } = await processMarkdownElement(
        doc,
        { x: cursor.x, y: cursor.y },
        listItem,
        options,
        itemPrefix,
      );

      cursor.y += height;
      totalHeight += height;
      totalWidth = Math.max(totalWidth, width);

      index += 1;
    }
  } else if (element.type === 'listItem') {
    const textOptions = {
      ...options,
      content: listPrefix + extractText(element),
    };

    const textSize = await addText(
      doc,
      { x: cursor.x, y: cursor.y },
      textOptions,
    );
    cursor.y += textSize.height;
    totalHeight += textSize.height;
    totalWidth = textSize.width;
  } else if (element.type === 'text' || element.type === 'link') {
    const textOptions = {
      ...options,
      content: extractText(element),
      link: element.type === 'link' ? element.url : undefined,
      underline: element.type === 'link' ? true : undefined,
    };

    const textSize = await addText(
      doc,
      { x: cursor.x, y: cursor.y },
      textOptions,
    );
    cursor.y += textSize.height;
    totalHeight += textSize.height;
    totalWidth += textSize.width;
  } else if (element.type === 'image') {
    const textOptions = {
      ...options,
      content: element.url,
      link: element.url,
      underline: true,
    };

    const textSize = await addText(
      doc,
      { x: cursor.x, y: cursor.y },
      textOptions,
    );
    cursor.y += textSize.height;
    totalHeight += textSize.height;
    totalWidth = textSize.width;
  } else if (element.children) {
    for (const child of element.children) {
      const { height, width } = await processMarkdownElement(
        doc,
        { x: cursor.x, y: cursor.y },
        child,
        options,
      );
      cursor.x += width;
      totalWidth += width;
      totalHeight = height;
    }
  }

  return { width: totalWidth, height: totalHeight };
}

export default async function addDescription(doc, cursor, options = {}) {
  const { content, width, lang, margin, simulate } = options;
  const currentCursor = { ...cursor };

  const parsedMarkdown = remark().parse(content.replace(/\\n/g, '\n'));

  let totalHeight = 0;

  for (const element of parsedMarkdown.children) {
    const baseOptions = {
      width,
      lang,
      simulate,
      bold: element.type === 'heading',
    };

    const { height } = await processMarkdownElement(
      doc,
      { x: cursor.x, y: cursor.y },
      element,
      baseOptions,
    );
    cursor.y += height + margin / 2;
    totalHeight += height + margin / 2;
  }

  cursor.y = currentCursor.y;

  return {
    width,
    height: totalHeight,
  };
}
