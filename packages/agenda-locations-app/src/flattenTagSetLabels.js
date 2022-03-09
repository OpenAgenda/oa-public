const flatLabel = (label, preferredLang) => (
  typeof label === 'string'
    ? label
    : label[preferredLang] || label[Object.keys(label)]
);

export default (tagSet, lang) => (
  {
    ...tagSet,
    groups: tagSet.groups.map(g => ({
      ...g,
      name: flatLabel(g.name, lang.toLowerCase()),
      tags: g.tags.map(t => ({
        ...t,
        label: flatLabel(t.label, lang.toLowerCase()),
      })),
    })),
  }
);
