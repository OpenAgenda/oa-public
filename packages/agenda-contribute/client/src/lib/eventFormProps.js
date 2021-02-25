export default ({ member, config }) => ({
  role: member?.role,
  withErrors: false,
  maxFileSize: config.maxFileSize,
  schemaExtensions: config.schemaExtensions,
  fileStore: config.fileStore,
  locationRes: config.locationRes,
  referencesRes: config.referencesRes,
  suggestionsRes: config.suggestionsRes,
  mapboxKey: config.mapboxKey,
  lang: config.lang,
  classNames: {
    fieldsCanvas: 'padding-all-md wsq padding-bottom-sm',
    bottomErrorsCanvas: 'error-summary padding-all-md',
  }
});
