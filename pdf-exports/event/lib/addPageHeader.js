import { getLocaleValue } from '@openagenda/intl';
import addText from './addText.js';
import addAgendaLogo from '../../utils/addAgendaLogo.js';
import addSeparatorLine from '../../utils/addSeparatorLine.js';

export default async function addPagetHeader(
  agenda,
  event,
  doc,
  cursor,
  options = {},
) {
  const { margin, isFirstPage, lang } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let heightOfSimulateTitle = null;
  let widthOfSimulateTitle = null;
  let heightOfTitle = null;
  let widthOfTitle = null;
  let logoHeight = 0;
  let logoWidth = null;
  let logoHeightAndWidth = 25;

  localCursor.y = 0;
  localCursor.y += margin / 6;

  const titleMaxWidth = doc.page.width - margin * 6 - logoHeightAndWidth - margin;

  const simulateTitle = addText(doc, localCursor, {
    content: isFirstPage ? agenda.title : agenda.title + ' - ' + getLocaleValue(event.title, lang),
    width: titleMaxWidth,
    simulate: true,
  });
  heightOfSimulateTitle = simulateTitle.height;
  widthOfSimulateTitle = simulateTitle.width;

  if (agenda.image) {
    if (titleMaxWidth < widthOfSimulateTitle) {
      widthOfSimulateTitle = titleMaxWidth;
    }

    const headerIconText = logoHeightAndWidth + margin + widthOfSimulateTitle;

    localCursor.x = (doc.page.width - headerIconText) / 2;

    const logo = await addAgendaLogo(
      doc,
      agenda.image,
      localCursor,
      logoHeightAndWidth,
    );

    logoHeight = logo.height;
    logoWidth = logo.width;

    if (heightOfSimulateTitle < logoHeight) {
      localCursor.y += (logoHeight - heightOfSimulateTitle) / 2;
    } else {
      localCursor.y = 0;
    }
  }

  localCursor.x += logoWidth + margin;

  const title = addText(doc, localCursor, {
    content: isFirstPage ? agenda.title : agenda.title + ' - ' + getLocaleValue(event.title, lang),
    width: titleMaxWidth,
  });

  heightOfTitle = title.height;
  widthOfTitle = title.width;

  const totalWidth = logoWidth + widthOfTitle + margin * 3;

  localCursor.y = Math.max(heightOfTitle, logoHeight + margin / 6) + margin / 6;
  localCursor.x = margin * 3;

  const { height: separatorLineHeight } = addSeparatorLine(doc, localCursor, {
    width: doc.page.width - margin * 6,
  });

  localCursor.y += cursor.y + separatorLineHeight;

  return {
    width: totalWidth,
    height: Math.max(logoHeight, localCursor.y - cursor.y),
    cursor: localCursor,
  };
}
