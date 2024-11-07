export default [
  {
    name: 'Default',
    description: 'A working setup',
    slug: 'default',
    config: (await import('./000_default.js')).default,
    req: { lang: 'fr' },
  },
  {
    name: 'Networks load fails',
    description: 'Shows a relevent error message',
    slug: 'networks-error',
    config: (await import('./100_networksError.js')).default,
  },
  {
    name: 'Network detail load fails',
    description: 'Shows a relevent error message',
    slug: 'network-error',
    config: (await import('./101_networkError.js')).default,
  },
  {
    name: 'Agendas load fails',
    description: 'A failing load',
    slug: 'agendas-error',
    config: await import('./102_agendasError.js').default,
    req: { lang: 'fr' },
  },
  {
    name: 'Network schema save fails',
    description: 'A relevent message appears',
    slug: 'network-schema-save-fail',
    config: (await import('./103_schemaUpdateError.js')).default,
  },
  {
    name: 'Agenda add to network fails',
    description: 'An attempt to add an agenda fails',
    slug: 'agenda-add-fail',
    config: (await import('./104_agendaAddError.js')).default,
  },
];
