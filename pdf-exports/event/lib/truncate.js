import addText from './addText.js';

export default async function truncate(doc, cursor, addFn, contentItem, remainingHeight, options = {}) {
  const { columnWidth, iconHeightAndWidth, margin, footerHeight, intl, lang } = options;

  const beforeOverflow = { ...contentItem };
  const afterOverflow = { ...contentItem };

  let currentText = '';
  let simulateHeight;
  let newRemainingHeight = remainingHeight - margin - footerHeight;

  if (contentItem.title) {
    const titleHeight = addText(doc, cursor, {
      content: contentItem.title,
      width: columnWidth,
      bold: true,
      intl,
      lang,
      simulate: true,
    });

    simulateHeight = titleHeight.height;
    if (simulateHeight > newRemainingHeight) {
      return [beforeOverflow, afterOverflow];
    }
    newRemainingHeight -= simulateHeight;
  }

  if (
    contentItem.addFn === 'addText'
    || contentItem.addFn === 'addStatus'
  ) {
    let words;
    if (contentItem.data.value && !contentItem.data.value.includes(' ')) {
      words = contentItem.data.value.split(' ');
    } else {
      words = contentItem.data.split(' ');
    }

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const accumulatedText = currentText ? `${currentText} ${word}` : word;

      const simulateAccumulatedText = addFn(doc, cursor, {
        content: accumulatedText,
        width: columnWidth,
        bold: contentItem.bold,
        intl,
        lang,
        simulate: true,
      });

      simulateHeight = simulateAccumulatedText.height;
      if (simulateHeight > newRemainingHeight) {
        beforeOverflow.data = currentText;
        afterOverflow.data = words.slice(i).join(' ');
        break;
      }
      currentText = accumulatedText;
    }
  } else if (contentItem.addFn === 'addCalendar') {
    const timings = contentItem.data;

    const simulatedCalendar = await addFn(doc, cursor, {
      content: timings,
      width: columnWidth,
      columnNumber: contentItem.columnNumber,
      intl,
      lang,
      margin,
      footerHeight,
      simulate: true,
      height: doc.page.height - margin,
    });

    beforeOverflow.data = timings;
    afterOverflow.data = timings.slice(timings.length - simulatedCalendar.remainingTimings.length);
  } else if (
    contentItem.addFn === 'addAdditionalFields') {
    const simulateAddAdditionalFields = await addFn(doc, cursor, {
      content: contentItem.data,
      agenda: contentItem.agenda,
      width: columnWidth,
      height: doc.page.height,
      margin,
      footerHeight,
      intl,
      lang,
      simulate: true,
    });

    simulateHeight = simulateAddAdditionalFields.height;

    if (simulateHeight > newRemainingHeight) {
      beforeOverflow.data = contentItem.data;
      afterOverflow.data = {
        ...contentItem.data,
        remainingFields: simulateAddAdditionalFields.remainingFields,
      };
    }
  } else if ( contentItem.addFn === 'addRegistration') {
    const simulateRegistration = await addFn(doc, cursor, {
      content: contentItem.data,
      width: columnWidth,
      height: doc.page.height,
      iconHeightAndWidth,
      margin,
      footerHeight,
      intl,
      lang,
      simulate: true,
    });

    simulateHeight = simulateRegistration.height;

    if (simulateHeight > newRemainingHeight) {
      beforeOverflow.data = contentItem.data;
      afterOverflow.data = {
        ...contentItem.data,
        registration: simulateRegistration.remainingFields,
        titleAdded: simulateRegistration.titleAdded,
      };
    }
  } else if (contentItem.addFn === 'addLocation') {
    const simulateAddLocation = await addFn(doc, cursor, {
      content: contentItem.data,
      width: columnWidth,
      iconHeightAndWidth,
      height: doc.page.height,
      margin,
      footerHeight,
      intl,
      lang,
      simulate: true,
    });

    simulateHeight = simulateAddLocation.height;

    if (simulateHeight > newRemainingHeight) {
      beforeOverflow.data = contentItem.data;
      afterOverflow.data = {
        ...contentItem.data,
        remainingContent: simulateAddLocation.remainingContent,
      };
    }
  }
  return [beforeOverflow, afterOverflow];
}