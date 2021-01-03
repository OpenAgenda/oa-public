'use strict';

const flatLabel = (label, preferredLang) => {
  return typeof label === 'string'
    ? label
    : label[preferredLang] || label[Object.keys(label)];
};

export default (tagSet, lang) => {
  return {
    ...tagSet,
    groups: tagSet.groups.map(g => ({
      ...g,
      name: flatLabel(g.name, lang),
      tags: g.tags.map(t => ({
        ...t,
        label: flatLabel(t.label, lang),
      })),
    })),
  };
};
