"use strict";

var React = require( 'react' ),

getLabel = require( '../lib/makeLabelGetter' )( require( '../labels' ) );

module.exports = React.createClass( {

  propTypes: {

    // value - usually a string
    lang: React.PropTypes.string,

    // the name of the input
    name: React.PropTypes.string,

    // used by component to load labels
    getLabel: React.PropTypes.func,
    
    // called when value changes
    onChange: React.PropTypes.func,

    // optional validator
    validator: React.PropTypes.func,

    // optional placeholder
    placeholder: React.PropTypes.string,

    // type of input ( textarea or text )
    type: React.PropTypes.string,

    // optional button
    renderButton: React.PropTypes.func

  },

  getInitialState: function() {

    return {
      userHasTyped: false
    }

  },

  getDefaultProps: function() {

    return {

      type: 'text',

    }

  },

  onChange: function( e ) {

    this.setState( {
      userHasTyped: true
    } );

    this.props.onChange( this.props.name, e.target.value );

  },

  getLabel: function( label, values ) {

    var str;

    if ( this.props.getLabel ) {

      str = this.props.getLabel( label, values, this.props.lang );

    }

    return str || getLabel( label, values, this.props.lang );

  },

  renderErrors: function() {

    var self = this;

    if ( !this.props.validator ) return null;

    if ( ( !this.props.value || !this.props.value.length ) && !this.state.userHasTyped ) return null;

    try {

      this.props.validator( this.props.value );

    } catch( errors ) {

      return <p>{ errors.map( function( error ) {

        return <span
          key={error.code}
          className="error">
          {self.getLabel( error.code, error.values, self.props.lang )}
        </span>

      } ) }</p>;

    }

    return null;

  },

  render: function() {

    return <div className="form-group">
      <label>{this.getLabel( this.props.name )}</label>
      <div className={this.props.className || ''}>
        {this.props.type!=="textarea" ? <input
          className="form-control"
          type="text"
          placeholder={this.getLabel( this.props.placeholder )}
          value={this.props.value}
          onChange={this.onChange} />
        : <textarea
          className="form-control"
          value={this.props.value}
          rows={6}
          onChange={this.onChange} /> } {this.props.renderButton ? this.props.renderButton() : ''}
      </div>
      {this.renderErrors()}
      {this.props.bottom ? this.props.bottom : null }
    </div>

  }

} );