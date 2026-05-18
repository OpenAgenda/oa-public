import integerValidator from '@openagenda/validators/integer';

const validate = integerValidator({ list: true });

export default () => validate;
