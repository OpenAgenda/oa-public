import _ from 'lodash';

export default (options = {}) =>
  (value) => {
    const {
      default: defaultLanguages,
      required,
      strict,
    } = _.assign(
      {
        default: null,
        required: null,
        strict: false,
      },
      options,
    );

    let languages;

    if (strict) {
      languages = required;
    } else if (required) {
      languages = _.uniq(required.concat(value || []));
    } else if (value && value.length !== 0) {
      languages = value;
    } else if (defaultLanguages) {
      languages = defaultLanguages;
    }

    return _.isArray(languages) ? languages.filter((l) => !!l) : [];
  };
