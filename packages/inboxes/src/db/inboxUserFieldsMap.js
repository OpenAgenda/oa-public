const fieldsMap = [
  {
    db: 'id',
    obj: 'id',
    protected: true // field is protected to modifications
    // internal: true, // field is visible only with this option set to true
    // json: true // format/parse this field as json
  },
  {
    db: 'inbox_id',
    obj: 'inboxId',
    protected: true
  },
  {
    db: 'user_uid',
    obj: 'userUid'
  },
  {
    db: 'left_at',
    obj: 'leftAt',
    protected: true
  }
];

export default fieldsMap;
