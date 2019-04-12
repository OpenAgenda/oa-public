"use string";

const _ = require( 'lodash' );

const labelFields = [ 'label', 'info', 'sub', 'help', 'placeholder' ];

module.exports = field => {

  const setLabelFIelds = labelFields.filter( f => _.get( field, f ) );

  return setLabelFIelds.filter( f => !_isMultilingual( field, f ) ).length !== setLabelFIelds.length;

}

function _isMultilingual( field, labelKey ) {

  return _.isObject( field[ labelKey ] );

}
