"use strict";

var React = require( 'react' );

module.exports = React.createClass( {

  propTypes: {

    // the name of the input
    name: React.PropTypes.string,

    // value - usually a string

    // used by component to load labels
    getLabel: React.PropTypes.func,
    
    // called when value changes
    onChange: React.PropTypes.func,

    // optional validator
    validator: React.PropTypes.func,

    // type of input ( textarea or text )
    type: React.PropTypes.string,

    // optional button
    renderButton: React.PropTypes.func

  },

  getDefaultProps: function() {

    return {

      type: 'text'

    }

  },

  onChange: function( e ) {

    this.props.onChange( this.props.name, e.target.value );

  },

  renderErrors: function() {

    var self = this;

    if ( !this.props.validator ) return null;

    try {

      this.props.validator( this.props.value );

    } catch( errors ) {

      return <p>{ errors.map( function( error ) {

        return <span
          key={error.code}
          className="error">
          {self.props.getLabel( error.code, error.values, self.props.lang )}
        </span>

      } ) }</p>;

    }

    return null;

  },

  render: function() {

    return <div className="form-group">
      <label>{this.props.getLabel( this.props.name )}</label>
      <div className={this.props.className || ''}>
        {this.props.type!=="textarea" ? <input
          className="form-control"
          type="text"
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