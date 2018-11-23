"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' );

module.exports = createReactClass({

  handleSubmit: function( e ) {

    e.preventDefault();

    var searchValue = this.refs.search.value;

    this.props.onSearchSubmit( searchValue );

  },

  render: function() {

    return (
      <form className="form-inline" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="search"></label>
          <input type="text" placeholder="search" ref="search" name="search" className="form-control" />
        </div>
        <button type="submit" className="btn btn-default">Ok</button>
      </form>
    );

  }

});
