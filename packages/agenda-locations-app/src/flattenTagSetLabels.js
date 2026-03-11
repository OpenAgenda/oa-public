const flatLabel = (label, preferredLang) => {
  if (!label || typeof label === 'string') return label;
  return label[preferredLang] || label[Object.keys(label)[0]];
};

export default (tagSet, lang) => ({
  ...tagSet,
  groups: tagSet.groups.map((g) => ({
    ...g,
    name: flatLabel(g.name, lang.toLowerCase()),
    info: flatLabel(g.info, lang.toLowerCase()),
    tags: g.tags.map((t) => ({
      ...t,
      label: flatLabel(t.label, lang.toLowerCase()),
    })),
  })),
});
