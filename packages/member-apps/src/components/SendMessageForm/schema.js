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
        field: 'subject',
        fieldType: 'text',
        label: getLabel('subject'),
      },
      {
        field: 'message',
        fieldType: 'markdown',
        label: getLabel('message'),
        optional: false,
      },
      {
        field: 'inactive',
        fieldType: 'boolean',
        label: getLabel('sendOnlyToInactives'),
      },
      {
        field: 'sendToMe',
        fieldType: 'boolean',
        label: getLabel('sendAlsoToMe'),
      },
    ],
  };
}
