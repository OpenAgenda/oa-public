export default function getEventSectionKeys(event, sections) {
  return [].concat(sections).map((key) => {
    const value = key.split('.').reduce((obj, prop) => obj?.[prop], event);
    return {
      key,
      value,
    };
  });
}
