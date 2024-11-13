import addText from './addText.js';
import iconPositioning from './iconPositioning.js';
import messages from './messages.js';

export default async function addRegistration(doc, cursor, options = {}) {
  const { content, height, width, iconHeightAndWidth, margin, footerHeight, intl, lang, simulate} = options;
  const currentCursor = { ...cursor };

  const availableHeight = height - margin - footerHeight;

  let accumulatedHeight = 0;
  let maxWidth = 0;
  let index = 0;
  const remainingRegistrations = content.registration;
  const titleAdded = content.titleAdded ;

  if (!titleAdded) {
    const simulateTitle = await addText(doc, cursor, {
      content: `${intl.formatMessage(messages.registrationTool)}`,
      width,
      bold: true,
      lang,
      simulate: true,
    });

    accumulatedHeight += simulateTitle.height;
    maxWidth = Math.max(maxWidth, simulateTitle.width);
    cursor.y += simulateTitle.height;

    const { height: lineHeight } = await addText(doc, cursor, {
      content: '.',
      simulate: true,
    });

    cursor.y += lineHeight;


    if(cursor.y > availableHeight) {
      cursor.y = currentCursor.y;
      return {
        remainingFields: remainingRegistrations,
        titleAdded: false,
        width: maxWidth,
        height: cursor.y,
      };
    }

    cursor.y -= simulateTitle.height;
    cursor.y -= lineHeight;

    const registrationTitle = await addText(doc, cursor, {
      content: `${intl.formatMessage(messages.registrationTool)}`,
      width,
      bold: true,
      lang,
      simulate,
    });

    cursor.y += registrationTitle.height;
  }

  while (index < remainingRegistrations.length) {
    const registration = remainingRegistrations[index];

    const simulateIcon = await iconPositioning(doc, cursor, registration.type, { iconHeightAndWidth, margin, simulate: true });

    const simulateReg = await addText(doc, cursor, {
      content: registration.value,
      width: width - iconHeightAndWidth - margin / 2,
      bold: content.bold,
      link: simulateIcon.linkPrefix + registration.value,
      lang,
      simulate: true,
    })

    accumulatedHeight += Math.max(simulateReg.height, simulateIcon.height);
    maxWidth = Math.max(maxWidth, simulateReg.width + simulateIcon.width + margin / 2);

    if (currentCursor.y + accumulatedHeight > availableHeight) {
      cursor.y = currentCursor.y;
      return {
        remainingFields: remainingRegistrations.slice(index),
        width: maxWidth,
        height: accumulatedHeight,
        titleAdded: true,
      };
    }

    const icon = await iconPositioning(doc, cursor, registration.type, { iconHeightAndWidth, margin });
    const reg = await addText(doc, cursor, {
      content: registration.value,
      width: width - iconHeightAndWidth - margin / 2,
      bold: content.bold,
      link: icon.linkPrefix + registration.value,
      lang,
      simulate,
    });

    cursor.y += reg.height;
    cursor.x = currentCursor.x;

    index += 1;
  }

  cursor.y = currentCursor.y;

  return {
    remainingFields: [],
    width: maxWidth,
    height: accumulatedHeight,
    titleAdded: true,
  };
}
