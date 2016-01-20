"use strict";

var React = require( 'react' ),

getLabel = require( '../lib/makeLabelGetter' )( require( '../labels' ) ),

orValidators = require( '../lib/orValidators' ),

TagsInput = require( 'react-tagsinput' );

module.exports = React.createClass( {

  propTypes: {

    // the form name of the field
    name: React.PropTypes.string,
    typeIconClassNames: React.PropTypes.object,
    value: React.PropTypes.string.isRequired,
    lang: React.PropTypes.string,
    validators: React.PropTypes.array

  },

  getInitialState: function() {

    return {
      inputValue: ''
    }

  },

  getDefaultProps: function() {

    return {

      name: 'multi_input',
      
      lang: 'en',

      typeIconClassNames: {
        link: 'fa fa-link',
        phone: 'fa fa-phone',
        email: 'fa fa-envelope',
        error: 'fa fa-exclamation-circle'
      },

      allowedTypes: [ 'link', 'email', 'phone' ]

    }

  },


  /**
   * value provided in props is a comma-separated
   * string. This provide a clean array
   * of those values with for each: value and type
   */
  
  getValues: function() {

    if ( !this.props.value ) return [];

    return this.props.value.split( ',' )

    .map( this.cleanValue );

  },


  /**
   * puts value through validators
   * returns an object with the value and the type
   */

  cleanValue: function( v ) {

    var validator;

    try {

      validator = orValidators( v, this.props.validators );

    } catch( e ) {

      return {
        value: v,
        type: 'error'
      }

    }

    return {
      value: v,
      type: validator.type
    }
 
  },

  getLabel: function( label, values ) {

    var str;

    if ( this.props.getLabel ) {

      str = this.props.getLabel( label, values, this.props.lang );

    }

    return str || getLabel( label, values, this.props.lang );

  },

  onChange: function( v ) {

    this.setState( { inputValue: '' } );

    this.props.onChange( this.props.name, v.map(  item => typeof item == 'string' ? item : item.value ).join( ', ' ) );

  },

  onBlur: function( v ) {

    var value = this.state.inputValue;

    if ( !value.length ) return;

    this.setState( { inputValue: '' } );

    // stick the last typed entry to the values and signal parent
    this.onChange( this.getValues().concat( value ) );

  },

  onInputChange: function( v ) {

    var value = v.target.value;

    if ( value.indexOf( ',' ) !== -1 ) {

      this.onChange( this.getValues().concat( value.split( ',' )[ 0 ] ) );

      value = value.split( ',' )[ 1 ];

    }

    this.setState( { inputValue: value } );

  },

  renderItem: function( t ) {

    if ( t.tag.type == 'error' ) t.className += ' error';

    return <span key={t.key} className={t.className}>
      <i className={this.props.typeIconClassNames[ t.tag.type || 'error' ]}></i>
      {t.tag.value}
      <a onClick={t.onRemove.bind( null, t.key )} />
    </span>

  },

  render: function() {

    var values = this.getValues(),

    error = !!values.filter( v => v.type=='error' ).length;

    return <div className={'multi-input' + ( error ? ' error' : '' )}>
      <label>{ this.getLabel( this.props.name ) }</label>
      <span className="info">{ error ? this.getLabel( 'multi-input.error' ) : this.props.info || this.getLabel( 'multi-input.info' )}</span>
      <TagsInput
        value={values} 
        renderTag={this.renderItem}
        onChange={this.onChange}
        inputProps={{
          onBlur: this.onBlur,
          onChange: this.onInputChange,
          value: this.state.inputValue
        }} />
    </div>

  }

} );