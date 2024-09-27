const integerValidator = require('@openagenda/validators/integer');

const validate = integerValidator({ list: true });

module.exports = () => validate;
