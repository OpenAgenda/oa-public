const { useIntl } = require('react-intl');

module.exports = function Total({ message, total }) {
  const intl = useIntl();

  return intl.formatMessage(message, { total });
};
