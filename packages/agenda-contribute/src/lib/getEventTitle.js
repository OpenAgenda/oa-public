import labels from '@openagenda/labels/agenda-contribute/event.js';

function getEventTitle(event, lang) {
  const titleLanguages = Object.keys(event.title || {});

  const eventLanguage = titleLanguages.includes(lang)
    ? lang
    : titleLanguages.shift();

  const title = [];

  if (event.draft) {
    title.push(labels.editDraftTitle[lang]);
  }

  if (eventLanguage) {
    title.push(event.title[eventLanguage]);
  }

  return title.join(': ');
}

export default getEventTitle;
