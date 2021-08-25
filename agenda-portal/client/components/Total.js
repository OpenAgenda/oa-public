const { useIntl } = require('react-intl');

module.exports = function Total({ message, total }) {
  const intl = useIntl();

  return intl.formatMessage({ id: message }, { total });
};
