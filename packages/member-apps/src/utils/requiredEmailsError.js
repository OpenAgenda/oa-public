export default origin => [
  {
    field: 'emails',
    origin,
    message: 'at least one email is required',
    code: 'required',
  },
];
