import logs from '@openagenda/logs';
import addText from './addText.js';
import adjustSize from './adjustSize.js';
import Cursor from './Cursor.js';
import rtd from './roundToDecimal.js';
import { keepDates } from './timings.utils.js';

const log = logs('addTimingsMonthSegment');

export default async function addTimingMonth(doc, parentCursor, params) {
  const {
    value: month,
    availableHeight,
    evaluateTitleHeight = true,
    simulate = false,
    margins,
  } = params;

  const {
    weeks: weekMargins = { bottom: 10 },
    monthTitle: monthTitleMargins = { bottom: 5 },
  } = margins;

  const displayMonthName = month.displayMonthName ?? true;

  log('processing', {
    availableHeight: rtd(availableHeight),
    simulate,
    displayMonthName,
    monthLabel: month.label,
  });

  const cursor = Cursor(parentCursor);
  const size = {
    width: 0,
    height: 0,
  };

  if (displayMonthName && evaluateTitleHeight) {
    const { height: titleHeight, width: titleWidth } = await addText(
      doc,
      cursor,
      {
        ...params,
        value: month.label,
        bold: true,
        simulate: true,
      },
    );

    log('  comparing available height with title height', {
      availableHeight: rtd(availableHeight),
      titleHeight: rtd(titleHeight),
      margins,
    });

    if (
      availableHeight
      < titleHeight + (margins.top ?? 0) + (margins.bottom ?? 0)
    ) {
      log('  not placing month item, height exceeds available height');
      return {
        height: 0,
        width: titleWidth,
        remaining: params.value,
        displayMonthName: true,
      };
    }
  }

  if (displayMonthName) {
    const monthTitleSize = await addText(doc, cursor, {
      ...params,
      value: month.label,
      bold: true,
    });

    monthTitleSize.height += monthTitleMargins.bottom;
    adjustSize(size, monthTitleSize);
    cursor.moveY(monthTitleSize.height);
  }

  for (const [weekIndex, week] of month.weeks.entries()) {
    for (const [dateIndex, date] of week.dates.entries()) {
      const value = `${date.label} - ${date.timings.map((t) => t.label).join(', ')}`;
      const dateSize = await addText(
        doc,
        { x: 0, y: 0 },
        {
          value,
          simulate: true,
        },
      );
      if (size.height + dateSize.height > availableHeight) {
        log('not placing date item, height exceeds available height', {
          value,
          dateSize,
          cursorY: cursor.y,
          height: size.height,
          availableHeight,
        });
        // add margins
        adjustSize(size, {
          height: 0,
          width: size.width + (margins.right ?? 0),
        });
        return {
          ...size,
          remaining: keepDates(
            { ...month, displayMonthName: false },
            weekIndex,
            dateIndex,
          ),
        };
      }
      await addText(doc, cursor, {
        ...params,
        value,
      });
      adjustSize(size, dateSize);

      cursor.moveY(dateSize.height);
    }

    cursor.moveY(weekMargins.bottom);

    adjustSize(size, { width: size.width, height: weekMargins.bottom });
  }

  // add margins
  adjustSize(size, {
    height: margins.bottom ?? 0,
    width: size.width + (margins.right ?? 0),
  });

  return size;
}
