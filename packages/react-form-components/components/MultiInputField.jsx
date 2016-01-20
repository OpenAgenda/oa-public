"use strict";

var React = require( 'react' ),

getLabel = require( '../lib/makeLabelGetter' )( require( '../labels' ) ),

TagsInput = require( 'react-tagsinput' );

module.exports = React.createClass( {

  propTypes: {

    // the form name of the field
    name: React.PropTypes.string,
    typeIconClassNames: React.PropTypes.object,
    value: React.PropTypes.string.isRequired,
    lang: React.PropTypes.string,
    validator: React.PropTypes.object

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

    this.setState( { inputValue: '' } );

    this.props.onChange( this.props.name, v.map( function( decoratedItem ) {

      return typeof decoratedItem == 'string' ? decoratedItem : decoratedItem.value;

    } ) );

  },

  onBlur: function( v ) {

    var value = this.state.inputValue;

    if ( !value.length ) return;

    this.setState( { inputValue: '' } );

    // stick the last typed entry to the values and signal parent
    this.onChange( this.decorate( this.props.value.concat( value ) ) );

  },

  onInputChange: function( v ) {

    var value = v.target.value;

    if ( value.indexOf( ',' ) !== -1 ) {

      this.onChange( this.decorate( this.props.value.concat( value.split( ',' )[ 0 ] ) ) );

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

    var values = this.decorate( this.props.value ),

    error = !!values.filter( v => !!v.errors ).length;

    return <div className="multi-input">
      <label>{ this.getLabel( this.props.name ) }</label>
      <span className={error ? 'error' : 'info'}>{ error ? this.getLabel( 'multi-input.error' ) : this.props.info || this.getLabel( 'multi-input.info' )}</span>
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