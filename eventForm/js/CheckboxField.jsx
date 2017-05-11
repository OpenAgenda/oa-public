"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' );

module.exports = createReactClass({

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
      <div className="checkbox">
        <label>
          <input type="checkbox" checked={this.props.value} onChange={this.onChange} />
          <span>{this.props.field.label[this.props.lang]}{this.props.field.optional ? '' : ' (*)'}</span>
        </label>
      </div>
    );

  }

});