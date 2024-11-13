import { spreadTimings } from '@openagenda/date-utils';
import addCalendarColumn from './addCalendarColumn.js';

export default async function addCalendar(doc, cursor, options = {}) {
  const { content, width, height, columnNumber, lang, margin, footerHeight, simulate } = options;
  const availableWidth = width;
  const availableHeight = height - margin - footerHeight;
  const timings = content;

  const initialCursor = { ...cursor };
  const currentCursor = { ...cursor };
  let remainingTimings = [...timings];

  const datesByMonth = spreadTimings(remainingTimings, 'Europe/Paris', { weekStartsOn: 1 });

  let isMonthFullyProcessed = false;
  let maxRowY = cursor.y;

  while (remainingTimings.length > 0) {
    for (const [_monthYear, _weeks] of Object.entries(datesByMonth)) {
      const result = await addCalendarColumn(
        doc,
        cursor,
        remainingTimings,
        isMonthFullyProcessed,
        { availableWidth, columnNumber, margin,lang, availableHeight, simulate }
      );

      remainingTimings = result.remainingTimings;
      isMonthFullyProcessed = result.noHeader;

      maxRowY = Math.max(maxRowY, result.maxCursorY);
      if (availableWidth && columnNumber) {
        cursor.x += availableWidth / columnNumber;
      }
      cursor.y = currentCursor.y;

      if (cursor.x >= availableWidth) {
        cursor.x = currentCursor.x;
        cursor.y = maxRowY + margin / 2;
        currentCursor.y = cursor.y;
      }

      if (cursor.y > availableHeight) {
        cursor.x = initialCursor.x;
        cursor.y = initialCursor.y;
        return {
          remainingTimings,
          isMonthFullyProcessed,
          width,
          height: cursor.y,
        };
      }
    }

    if (isMonthFullyProcessed) {
      break;
    }
  }

  cursor.x = initialCursor.x;
  
  return {
    remainingTimings,
    width,
    height: maxRowY - cursor.y,
  };
}
