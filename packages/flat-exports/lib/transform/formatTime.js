import moment from 'moment';

export default ({ languages, includeLanguages }, { target, source }) => {
  let targetLanguages = languages;
  if (includeLanguages) {
    targetLanguages = targetLanguages.filter((l) =>
      includeLanguages.includes(l));
  }

  return {
    source,
    target: targetLanguages.map(
      (l) =>
        (target || source)
        + (languages.length > 1 ? ` - ${l.toUpperCase()}` : ''),
    ),
    transform: (time) =>
      targetLanguages.map((lang) =>
        moment(time).locale(lang).format('dddd D MMMM YYYY')),
  };
};
