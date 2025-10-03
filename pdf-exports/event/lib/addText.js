import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import logs from '@openagenda/logs';
import { getLocaleValue } from '@openagenda/intl';
import messages from '../../lib/messages.js';
import getIntl from '../../utils/intl.js';
import Cursor from './Cursor.js';
import adjustSize from './adjustSize.js';
import rtd from './roundToDecimal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const maxLoopCount = 100;

const getSelectedFont = ({ bold, medium }) => {
  if (bold) {
    return `${__dirname}/../../fonts/Assistant-Bold-Emojied.ttf`;
  }
  if (medium) {
    return `${__dirname}/../../fonts/Assistant-Medium-Emojied.ttf`;
  }
  return `${__dirname}/../../fonts/Assistant-Regular-Emojied.ttf`;
};

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

function splitWord(doc, word, availableWidth, separator = '-') {
  log('splitting %s', word, rtd({ availableWidth }));
  let overflowingAtIndex = 0;
  while (
    doc.widthOfString(`${word.substr(0, overflowingAtIndex)}${separator}`)
    < availableWidth
  ) {
    overflowingAtIndex += 1;
  }
  return [
    word.substr(0, overflowingAtIndex - 1) + separator,
    separator + word.substr(overflowingAtIndex - 1),
  ];
}

function doesWordFitInLine(doc, line, width, word) {
  return doc.widthOfString(`${line}${line.length ? ' ' : ''}${word}`) <= width;
}

function appendWord(line, word) {
  if (!line.length) {
    return word;
  }

  return `${line}${line[line.length - 1] === ' ' ? '' : ' '}${word}`;
}

function convertWordsToLine(
  doc,
  { paragraphWordsToAdd, availableWidth, paragraphAvailableWidth, isFirstLine },
) {
  let line = '';
  let wordFits = true;
  let isWordFirstOfLine = true;

  const lineAvailableWidth = !isFirstLine && paragraphAvailableWidth
    ? paragraphAvailableWidth
    : availableWidth;

  while (wordFits && paragraphWordsToAdd.length) {
    const word = paragraphWordsToAdd.shift();
    wordFits = doesWordFitInLine(doc, line, lineAvailableWidth, word);
    log(
      '  adding word %s to line: word %s',
      word,
      wordFits ? 'fits' : 'does not fit',
    );

    if (
      !wordFits
      && isWordFirstOfLine
      // && isWordFirstOfLine({ line, availableWidth, paragraphAvailableWidth })
    ) {
      log('    word does not fit and is first of line: must be split');
      const [wordPartThatFits, restOfWord] = splitWord(
        doc,
        word,
        lineAvailableWidth,
      );
      paragraphWordsToAdd.splice(0, 1, restOfWord);
      line = wordPartThatFits;
      continue;
    }
    if (!wordFits) {
      log('    word does not fit');
      paragraphWordsToAdd.splice(0, 0, word);
      wordFits = false;
      continue;
    }
    line = appendWord(line, word);
    isWordFirstOfLine = false;
  }
  return line;
}

function extractWords(str) {
  return str.split(' ').map((w) => (w.length ? w : ' '));
}

function spreadTextIntoLines(doc, params = {}) {
  const {
    value,
    paragraphAvailableWidth, // available total width for a paragraph
    availableWidth, // remaining available width on current line where provided text is to be placed
    fontSize,
    base,
  } = params;

  doc.font(getSelectedFont(params)).fontSize(getFontSize(fontSize, base));

  const paragraphs = value.split('\n');
  const lines = [];
  log('spreading %s paragraphs into lines', paragraphs.length);

  for (const [index, paragraph] of paragraphs.entries()) {
    const paragraphLines = [];
    const paragraphWordsToAdd = extractWords(paragraph);
    log('  paragraph %s has %s words', index, paragraphWordsToAdd.length);
    let loopCount = 0;
    while (paragraphWordsToAdd.length) {
      loopCount += 1;
      if (loopCount >= maxLoopCount) {
        throw new Error('max iteration count reached');
      }
      paragraphLines.push(
        convertWordsToLine(doc, {
          paragraphWordsToAdd,
          availableWidth,
          paragraphAvailableWidth,
          isFirstLine: !paragraphLines.length,
        }),
      );
    }
    paragraphLines.forEach((line) => lines.push(line));
  }

  return lines;
}

function addLine(doc, parentCursor, params = {}) {
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
      .font(getSelectedFont(params))
      .fontSize(getFontSize(fontSize, base))
      .text(value, cursor.x, cursor.y, {
        width: availableWidth,
        underline,
        link,
        align,
        oblique: params.italic ? true : undefined,
      });
  }

  const size = {
    width: doc.widthOfString(value),
    height: doc.heightOfString(value, { width: availableWidth }),
  };

  log('added', { value, size });

  return size;
}

function getAvailableWidth(doc, cursor, params) {
  const { width: legacyWidth, availableWidth } = params;

  if (availableWidth || legacyWidth) {
    return availableWidth || legacyWidth;
  }

  return doc.page.width - cursor.x - doc.page.margins.right;
}

export default function addText(doc, parentCursor, params = {}) {
  const {
    availableHeight = doc.page.height
      - (doc.page.margins?.bottom ?? 0)
      - parentCursor.y ?? 0,
    value,
    content,
    lang,
    segmentable = null,
    displayUnsetMessage,
  } = params;

  const cursor = Cursor(parentCursor);

  const text = getLocaleValue(value ?? content, lang);

  if ([undefined, null].includes(text)) {
    log('addText - empty');
    return displayUnsetMessage
      ? addText(doc, parentCursor, {
        ...params,
        value: getIntl(lang).formatMessage(messages.noText),
        italic: true,
      })
      : {
        width: 0,
        height: 0,
      };
  }

  // available width on the line where given content is to be placed.
  const availableWidth = getAvailableWidth(doc, cursor, params);

  if (!segmentable) {
    log('not segmentable');
    const { remaining } = addText(doc, cursor, {
      ...params,
      simulate: true,
      segmentable: true,
    });

    if (remaining.length) {
      log(
        'could not place all content of not segmentable text, returning as remaining',
      );
      return {
        width: 0,
        height: 0,
        remaining: value ?? content,
      };
    }
  }

  const size = {
    width: 0,
    height: 0,
  };

  const lines = spreadTextIntoLines(doc, {
    ...params,
    availableWidth,
    value: text,
  });

  log('spread text on %s lines', lines.length);
  for (const [index, line] of lines.entries()) {
    const lineSize = addLine(doc, cursor, {
      ...params,
      availableWidth,
      value: line,
      simulate: true,
    });

    if (size.height + lineSize.height > availableHeight) {
      log('segment size exceeds available height', {
        cursorAt: size.height,
        lineSizeHeight: lineSize.height,
        availableHeight,
      });
      return {
        ...size,
        overflowingHeight: size.height + lineSize.height,
        remaining: lines.slice(index).join(' '),
      };
    }

    addLine(doc, cursor, {
      ...params,
      value: line,
      availableWidth,
    });
    adjustSize(size, lineSize);

    cursor.moveY(lineSize.height);

    if (index === lines.length - 1) {
      cursor.moveX(lineSize.width);
    }
  }

  return {
    ...size,
    remaining: '',
  };
}
