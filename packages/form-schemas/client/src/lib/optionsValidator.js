import _ from 'lodash';

// its all about having options

export default validatorOptions => optionValues => {

  const { optional, field } = _.assign( {
    optional: true,
    field: null
  }, validatorOptions || {} );

  if ( !optional && ( !_.isArray( optionValues ) || !optionValues.length ) ) {

    throw [ _.assign( {
      code: 'options.empty',
      message: 'option list cannot be empty',
      origin: optionValues
    }, field ? { field } : {} ) ];

  }

  return optionValues;

}
