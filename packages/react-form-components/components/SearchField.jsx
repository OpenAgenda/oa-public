"use strict";

var React = require( 'react' ),

Spinner = require( 'spinner' );

module.exports = React.createClass( {

  propTypes: {
    value: React.PropTypes.string,
    name: React.PropTypes.string,
    dynamic: React.PropTypes.bool,
    timeout: React.PropTypes.number,
    loading: React.PropTypes.bool
  },

  getDefaultProps: function() {

    return {
      value: '',
      name: 'search',
      dynamic: false,
      timeout: 1500,
      loading: false
    }

  },

  getInitialState: function() {

    return {
      value: this.props.value,
      edit: this.props.value
    }

  },

  componentDidUpdate: function() {

    if ( this.props.value !== this.state.value ) {

      this.setState( {
        value: this.props.value,
        edit: this.props.value
      } );

    }

  },

  clearTimeout: function() {

    if ( this.timeout ) {

      clearTimeout( this.timeout );

      this.timeout = undefined;

    }

  },

  onChange: function( e ) {

    var self = this;

    this.setState( {
      edit: e.target.value.length ? e.target.value : undefined
    } );

    this.clearTimeout();

    this.timeout = setTimeout( function() {

      self.props.onChange( self.state.edit );

      self.setState( {
        value: self.state.edit
      } );

      self.timeout = undefined;

    }, this.props.timeout );

  },

  onCommit: function( e ) {

    e.preventDefault();

    if ( typeof e.keyCode == 'undefined' || e.keyCode == 13 ) {

      this.clearTimeout();

      this.props.onChange( this.state.edit );

      this.setState( {
        value: this.state.edit
      } );

    }

  },

  isLoading: function() {

    return !!( this.props.loading || this.timeout );

  },

  renderSpinner: function() {

    return <div className="input-spinner">
      <Spinner
        loading={this.isLoading()}
        spinner={{
          width: 1,
          length: 3,
          radius: 4,
          color: '#666'
        }} />
    </div>

  },

  renderButton: function() {

    return <span className="input-group-btn">
      <button 
        className="btn btn-default"
        type="button"
        onClick={this.onCommit}>
        {this.props.loading?this.renderSpinner():<i className="fa fa-search"></i>}
      </button>
    </span>

  },

  render: function() {

    return <div className={this.props.dynamic ? '' : 'input-group' }>
      <label className="sr-only" for={this.props.name}>{this.props.label}</label>
      <input
        placeholder={this.props.placeholder}
        type="text"
        className="form-control"
        onChange={this.onChange}
        onKeyUp={this.onCommit}
        value={this.state.edit || ''} />
      {this.props.dynamic?this.renderSpinner():this.renderButton()}
    </div>

  }

} );