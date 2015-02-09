var React = require( 'react' );

module.exports = React.createClass({

  handleSubmit: function( e ) {

    e.preventDefault();

    var searchValue = this.refs.search.getDOMNode().value;

    this.props.onSearchSubmit( searchValue );

  },

  render: function() {

    return (
      <form className="form-inline" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label for="search"></label>
          <input type="text" placeholder="search" ref="search" name="search" className="form-control" />
        </div>
        <button type="submit" className="btn btn-default">Ok</button>
      </form>
    );

  }

});