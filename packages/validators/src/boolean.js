import utils from '@openagenda/utils'

export default config => {

  let params = utils.extend( {
    field: false,
    default: undefined,
    optional: true,
    allowNull: false
  }, config );

  return utils.extend( validate, {
    type: 'boolean',
    field: params.field
  } );

  function validate( value ) {

    if ( typeof value === 'undefined' ) {

      if ( !params.optional && ( typeof params.default === 'undefined' ) ) {

        throw [ {
          field: validate.field,
          code: 'required',
          message: 'a boolean is required',
          origin: value
        } ];

      }

      if ( typeof params.default !== 'undefined' && params.default !== null ) {

        return !!params.default;

      }

      return null;

    }

    if ( value === null && ( params.default === null || params.allowNull ) ) {

      return null;

    }

    if ( [ '0', 'false', false ].indexOf( value ) !== -1 ) {

      return false;

    }

    return !!value;

  }

}
