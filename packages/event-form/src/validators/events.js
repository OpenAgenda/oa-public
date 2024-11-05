import integerValidator from '@openagenda/validators/integer.js';

const validate = integerValidator({ list: true });

export default () => validate;
