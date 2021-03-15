const fieldsMap = [
  {
    db: 'id',
    obj: 'id',
    protected: true, // field is protected to modifications
    // internal: true, // field is visible only with this option set to true
    // json: true // format/parse this field as json
  },
  {
    db: 'conversation_id',
    obj: 'conversationId',
    protected: true,
  },
  {
    db: 'inbox_user_id',
    obj: 'inboxUserId',
    protected: true,
  },
  {
    db: 'body',
    obj: 'body',
  },
  {
    db: 'created_at',
    obj: 'createdAt',
    protected: true,
  },
];

export default fieldsMap;
