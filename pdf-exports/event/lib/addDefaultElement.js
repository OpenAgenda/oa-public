import logs from '@openagenda/logs';
import addText from './addText.js';
import rtd from './roundToDecimal.js';

const log = logs('addDefaultElement');

const lgi = (depth) => '  '.repeat(depth);

function extractText(element) {
  if (element.type === 'text') {
    return element.value;
  }
  if (element.children) {
    return element.children.map(extractText).join(' ');
  }
  return '';
}

function isOverflowing(doc, cursor, size) {
  const availableHeight = doc.page.height - (doc.page.margins?.bottom ?? 0);
  return cursor.y + size.height > availableHeight;
}

export default async function addDefaultElement(doc, state, element, params) {
  const link = element.url || params.url;
  const value = `${params.prefix ?? ''}${extractText(element)}`;
  log(`${lgi(params.depth)}addDefaultElement`, { value, link });
  const { cursor } = state;
  const { remaining, ...size } = addText(doc, state.cursor, {
    ...params,
    value,
    link,
    underline: !!link,
    segmentable: true,
  });

  if (!remaining?.length) {
    log(
      `${lgi(params.depth)} ↦ moving cursor to the right by %s`,
      rtd(size.width),
    );
    cursor.moveX(size.width);
    return {
      remaining,
      overflow: isOverflowing(doc, cursor, size),
    };
  }

  log(`${lgi(params.depth)} ↦ remaining: "%s"`, remaining);
  cursor.setX(cursor.init.x);
  cursor.moveY(cursor.lineHeight);

  return {
    remaining,
    overflow: isOverflowing(doc, cursor, size),
  };
}
