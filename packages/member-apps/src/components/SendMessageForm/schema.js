export default function getMessageSchema({ getLabel, lang }) {
  return {
    fields: [
      {
        field: 'replyTo',
        fieldType: 'email',
        label: getLabel('replyTo'),
        placeholder: `${
          lang === 'fr' ? 'ne-pas-repondre' : 'no-reply'
        }@openagenda.com`,
      },
      {
        field: 'message',
        fieldType: 'markdown',
        label: getLabel('message'),
      },
      {
        field: 'inactive',
        fieldType: 'boolean',
        label: getLabel('sendOnlyToInactives'),
      },
    ],
  };
}
