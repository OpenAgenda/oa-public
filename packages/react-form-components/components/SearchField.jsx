"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

Spinner = require( './Spinner' );

module.exports = createReactClass( {

  displayName: 'SearchField',

  propTypes: {
    value: PropTypes.string,
    threshold: PropTypes.number,
    name: PropTypes.string,
    dynamic: PropTypes.bool,
    timeout: PropTypes.number,
    loading: PropTypes.bool,
    enableLoadingDisplay: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func
  },

  getDefaultProps: function() {

    return {
      value: '',
      name: 'search',
      dynamic: false,
      timeout: 1500,
      loading: false,
      threshold: 2,
      enableLoadingDisplay: true
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

  onFocus: function( e ) {

    if ( !this.props.onFocus ) return;

    this.props.onFocus( e.target.value );

  },

  onChange: function( e ) {

    var self = this;

    this.setState( {
      edit: e.target.value.length ? e.target.value : undefined
    } );


    /**
     * A change call should be delayed only if the previous
     * change has been called less than a threshold delay
     **/

    if ( e.target.value.length < this.props.threshold ) {

      return;

    }

    if ( !this.timeout ) {

      self.props.onChange( self.props.name, self.state.edit );

      self.setState( {
        value: self.state.edit
      } );

      this.timeout = setTimeout( function() {

        self.timeout = undefined;

      }, this.props.timeout );

    } else {

      this.clearTimeout();

      this.timeout = setTimeout( function() {

        self.props.onChange( self.props.name, self.state.edit );

        self.setState( {
          value: self.state.edit
        } );

        self.timeout = undefined;

      }, this.props.timeout );

    }

  },

  onCommit: function( e ) {

    e.preventDefault();

    if ( typeof e.keyCode == 'undefined' || e.keyCode == 13 ) {

      this.clearTimeout();

      this.props.onChange( this.props.name, this.state.edit );

      this.setState( {
        value: this.state.edit
      } );

    }

  },

  isLoading: function() {

    if ( !this.props.enableLoadingDisplay ) return false;

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

    return <div className={this.props.dynamic ? 'search-field' : 'search-field input-group' }>
      <label className="sr-only" htmlFor={this.props.name}>{this.props.label}</label>
      <input
        placeholder={this.props.placeholder}
        type="text"
        className="form-control"
        onFocus={this.onFocus}
        onChange={this.onChange}
        onKeyUp={this.onCommit}
        value={this.state.edit || ''} />
      {this.props.dynamic?this.renderSpinner():this.renderButton()}
    </div>

  }

} );