"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

getLabel = require( '../lib/makeLabelGetter' )( require( '../labels' ) ),

TagsInput = require( 'react-tagsinput' );

module.exports = createReactClass( {

  displayName: 'MultiInputField',

  propTypes: {

    value: PropTypes.array,
    // the form name of the field
    name: PropTypes.string,
    typeIconClassNames: PropTypes.object,
    lang: PropTypes.string,
    validator: PropTypes.func,
    enabled: PropTypes.bool

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

      allowedTypes: [ 'link', 'email', 'phone' ],

      enabled: true

    }

  },

  decorate: function( values ) {

    return this.props.validator.decorate( values );

  },

  getLabel: function( label, values ) {

    var str;

    if ( this.props.getLabel ) {

      str = this.props.getLabel( label, values, this.props.lang );

    }

    return str || getLabel( label, values, this.props.lang );

  },

  onChange: function( v ) {

    if ( !this.props.enabled ) return;

    this.setState( { inputValue: '' } );

    this.props.onChange( this.props.name, v.map( function( decoratedItem ) {

      return typeof decoratedItem == 'string' ? decoratedItem : decoratedItem.value;

    } ) );

  },

  onBlur: function( v ) {

    if ( !this.props.enabled ) return;

    var value = this.state.inputValue;

    if ( !value.length ) return;

    this.setState( { inputValue: '' } );

    // stick the last typed entry to the values and signal parent
    this.onChange( this.decorate( ( this.props.value || [] ).concat( value ) ) );

  },

  onInputChange: function( v ) {

    var value = v.target.value;

    if ( value.indexOf( ',' ) !== -1 ) {

      this.onChange( this.decorate( ( this.props.value || [] ).concat( value.split( ',' )[ 0 ] ) ) );

      value = value.split( ',' )[ 1 ];

    }

    this.setState( { inputValue: value } );

  },

  renderItem: function( t ) {

    if ( t.tag.errors ) t.className += ' error';

    return <span key={t.key} className={t.className}>
      <i className={this.props.typeIconClassNames[ t.tag.type || 'error' ]}></i>
      {t.tag.value}
      <a onClick={t.onRemove.bind( null, t.key )} />
    </span>

  },

  render: function() {

    var values = this.decorate( this.props.value || [] ),

    error = !!values.filter( function( v ) { return !!v.errors } ).length;

    return <div className={ this.props.enabled ? 'multi-input' : 'multi-input disabled' }>
      <label>{ this.getLabel( this.props.name ) }</label>
      <TagsInput
        value={values} 
        renderTag={this.renderItem}
        onChange={this.onChange}
        inputProps={{
          placeholder: null,
          onBlur: this.onBlur,
          onChange: this.onInputChange,
          value: this.state.inputValue,
          disabled: !this.props.enabled
        }} />
      <span className={error ? 'error' : 'info'}>{ error ? this.getLabel( 'multi-input.error' ) : this.props.info || this.getLabel( 'multi-input.info' )}</span>
      { this.props.bottom ? this.props.bottom : null }
    </div>

  }

} );