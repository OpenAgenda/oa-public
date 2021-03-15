const fieldsMap = [
  {
    db: 'id',
    obj: 'id',
    protected: true, // field is protected to modifications
    // internal: true, // field is visible only with this option set to true
    // json: true // format/parse this field as json
  },
  {
    db: 'type',
    obj: 'type',
  },
  {
    db: 'identifier',
    obj: 'identifier',
  },
];

export default fieldsMap;
