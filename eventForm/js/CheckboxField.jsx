"use strict";

var React = require( 'react' );

module.exports = React.createClass({

  componentDidMount: function() {

    this.update( this.props.value );

  },

  onChange: function( e ) {

    this.update( e.target.checked );

  },

  update: function( value ) {

    this.props.handleUpdate( value );

  },

  render: function() {

    return ( 
      <ul className="cform">
        <li>
          <input type="checkbox" checked={this.props.value} onChange={this.onChange} />
          <label>{this.props.field.label[this.props.lang]}{this.props.field.optional ? '' : ' (*)'}</label>
        </li>
      </ul>
    );

  }

});