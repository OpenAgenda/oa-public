import addText from './addText.js';

export default async function truncate(doc, cursor, addFn, contentItem, remainingHeight, options = {}) {
  const { columnWidth, iconHeightAndWidth, margin, lang } = options;

  const beforeOverflow = { ...contentItem };
  const afterOverflow = { ...contentItem };

  let currentText = '';
  let simulateHeight;
  let newRemainingHeight = remainingHeight;

  if (contentItem.title) {
    const titleHeight = addText(doc, cursor, {
      content: contentItem.title,
      width: columnWidth,
      bold: true,
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
    || contentItem.addFn === 'addRegistration'
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
      lang,
      simulate: true,
      height: doc.page.height,
    });

    beforeOverflow.data = timings;
    afterOverflow.data = timings.slice(timings.length - simulatedCalendar.remainingTimings.length);
  } else if (contentItem.addFn === 'addAdditionalFields') {
    const simulateAddAdditionalFields = await addFn(doc, cursor, {
      content: contentItem.data,
      agenda: contentItem.agenda,
      width: columnWidth,
      height: doc.page.height,
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
  } else if (contentItem.addFn === 'addLocation') {
    const simulateAddLocation = await addFn(doc, cursor, {
      content: contentItem.data,
      width: columnWidth,
      iconHeightAndWidth,
      height: doc.page.height,
      margin,
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