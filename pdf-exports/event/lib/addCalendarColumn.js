import { spreadTimings } from '@openagenda/date-utils';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import capitalize from 'lodash/capitalize.js';
import addText from './addText.js';

export default async function addCalendarColumn(doc, cursor, timings, noHeader, options = {}) {
  const { availableSpace, columnNumber, height, lang, simulate } = options;
  const remainingTimings = spreadTimings(timings, 'Europe/Paris', { weekStartsOn: 1 });
  const [monthYear, weeks] = Object.entries(remainingTimings)[0];
  const monthYearContent = capitalize(format(parseISO(monthYear), 'MMMM yyyy', { locale: fr }));
  let maxCursorY = cursor.y;

  const currentCursor = { ...cursor };

  if (!noHeader ) {
    const { height: simulateMonthYearHeight } = await addText(doc, cursor, {
      content: monthYearContent,
      width: availableSpace / columnNumber,
      bold: true,
      lang,
      simulate: true,
    });
    cursor.y += simulateMonthYearHeight;

    const { height: lineHeight } = await addText(doc, cursor, {
      content: '.',
      simulate: true,
    });
    cursor.y += lineHeight;

    if(cursor.y > height) {
      cursor.y = currentCursor;
      return {
        remainingTimings: timings,
        noHeader: false,
        maxCursorY,
      };
    }
    cursor.y -= simulateMonthYearHeight;
    cursor.y -= lineHeight;

    const { height: monthYearHeight } = await addText(doc, cursor, {
      content: monthYearContent,
      width: availableSpace / columnNumber,
      bold: true,
      lang,
      simulate,
    });
    cursor.y += monthYearHeight;
    maxCursorY = Math.max(maxCursorY, cursor.y);
  }

  let index = 0;

  for (const [_week, dates] of Object.entries(weeks)) {
    const dateEntries = Object.entries(dates);
    for (let i = 0; i < dateEntries.length; i++) {
      const [date, isoDatesTimes] = dateEntries[i];

      index += 1;

      const formattedDate = format(parseISO(date), 'EEEE d', { locale: fr });
      const beginTime = format(parseISO(isoDatesTimes[0].begin), 'HH:mm');
      const endTime = format(parseISO(isoDatesTimes[0].end), 'HH:mm');
      const dateTimeContent = `${formattedDate}: ${beginTime}-${endTime}`;

      const { height: simulatedHeight } = await addText(doc, cursor, {
        content: dateTimeContent,
        width: availableSpace / columnNumber,
        lang,
        simulate: true,
        debug: false,
      });
      
      if (cursor.y + simulatedHeight > height) {
        cursor.y = currentCursor;
        return {
          remainingTimings: timings.slice(index - 1),
          noHeader: true,
          maxCursorY,
        };
      }

      const { height: dateTimeHeight } = await addText(doc, cursor, {
        content: dateTimeContent,
        width: availableSpace / columnNumber,
        lang,
        simulate,
      });
      cursor.y += dateTimeHeight;
      maxCursorY = Math.max(maxCursorY, cursor.y);
    }
    cursor.y += 10;
  }
  cursor.y = currentCursor;
  
  return {
    remainingTimings: timings.slice(index),
    noHeader: false,
    maxCursorY,
  };
}
