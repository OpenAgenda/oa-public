import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import logs from '@openagenda/logs';
import { getLocaleValue } from '@openagenda/intl';
import Cursor from './Cursor.js';
import adjustSize from './adjustSize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getSelectedFont = ({ bold, medium }) => {
  if (bold) {
    return `${__dirname}/../../fonts/Assistant-Bold.ttf`;
  }
  if (medium) {
    return `${__dirname}/../../fonts/Assistant-Medium.ttf`;
  }
  return `${__dirname}/../../fonts/Assistant-Regular.ttf`;
};

const segmentableThreshold = 200;

const log = logs('addText');

const getFontSize = (fontSize, base = {}) => {
  const baseFontSize = base?.fontSize ?? 12;

  if (fontSize === undefined) {
    return baseFontSize;
  }

  if (fontSize && fontSize.match(/em$/)) {
    return parseFloat(fontSize.replace(/em$/, '')) * baseFontSize;
  }

  return fontSize;
};

function spreadTextIntoSegments(doc, params = {}) {
  const { value, availableWidth, fontSize, base } = params;

  doc.font(getSelectedFont(params)).fontSize(getFontSize(fontSize, base));

  return value.split('\n').reduce((segments, paragraph) => {
    const [paragraphSegments, lastParagraphSegment] = paragraph
      .split(' ')
      .reduce(
        ([pSegments, lastSegment], word) => {
          const wordFits = doc.widthOfString(`${lastSegment} ${word}`) <= availableWidth;
          return [
            wordFits ? pSegments : [...pSegments, lastSegment],
            wordFits
              ? `${lastSegment}${lastSegment.length ? ' ' : ''}${word}`
              : word,
          ];
        },
        [[], ''],
      );
    return segments.concat(paragraphSegments).concat(lastParagraphSegment);
  }, []);
}

function addTextSegment(doc, parentCursor, params = {}) {
  const {
    fontSize,
    color,
    base = {
      color: '#413a42',
      fontSize: 12,
    },
    underline,
    link,
    align,
    simulate = false,
    value,
    availableWidth,
  } = params;

  const cursor = Cursor(parentCursor);

  doc.font(getSelectedFont(params)).fontSize(getFontSize(fontSize, base));

  if (!simulate) {
    doc
      .fillColor(color ?? base.color)
      .font(getSelectedFont(params)) // ???
      .fontSize(getFontSize(fontSize, base)) // ???
      .text(value, cursor.x, cursor.y, {
        width: availableWidth,
        underline,
        link,
        align,
      });
  }

  const size = {
    width: doc.widthOfString(value),
    height: doc.heightOfString(value, { width: availableWidth }),
  };

  log('added', { value, size });

  return size;
}

export default function addText(doc, parentCursor, params = {}) {
  const {
    width: legacyWidth,
    availableHeight,
    value,
    content,
    lang,
    segmentable = null,
  } = params;

  const cursor = Cursor(parentCursor);

  const text = getLocaleValue(value ?? content, lang);

  if ([undefined, null].includes(text)) {
    return { width: 0, height: 0 };
  }

  const availableWidth = params.availableWidth ?? legacyWidth;
  const simulatedHeight = doc.heightOfString(text, { width: availableWidth });

  const overflows = availableHeight && simulatedHeight > availableHeight;

  if (overflows && segmentable === false) {
    return {
      width: 0,
      height: 0,
      remaining: text,
    };
  }

  if (
    overflows
    && segmentable === null
    && simulatedHeight > segmentableThreshold
  ) {
    return addText(doc, parentCursor, { ...params, segmentable: true });
  }

  if (overflows && segmentable) {
    const size = { width: 0, height: 0 };

    const segments = spreadTextIntoSegments(doc, {
      ...params,
      availableWidth,
      value: text,
    });
    for (const [index, segment] of segments.entries()) {
      const segmentSize = addTextSegment(doc, cursor, {
        ...params,
        availableWidth,
        value: segment,
        simulate: true,
      });

      if (size.height + segmentSize.height > availableHeight) {
        return {
          ...size,
          remaining: segments.slice(index).join(' '),
        };
      }

      addTextSegment(doc, cursor, {
        ...params,
        value: segment,
        availableWidth,
      });
      adjustSize(size, segmentSize);
      cursor.moveY(segmentSize.height);
    }
  }

  return addTextSegment(doc, parentCursor, {
    ...params,
    value: text,
    availableWidth,
  });
}
