import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Spinner from '@openagenda/react-form-components/build/Spinner';

module.exports = createReactClass( {

  displayName: 'SearchField',

  propTypes: {
    value: PropTypes.string,
    name: PropTypes.string,
    loading: PropTypes.bool
  },

  getDefaultProps: function () {

    return {
      value: '',
      name: 'search',
      loading: false,
      onFocus: () => {}
    }

  },

  onChange: function ( e ) {

    this.props.onChange( e.target.value );

  },

  onFocus: function( e ) {

    this.props.onFocus( e.target.value );

  },

  onCommit: function ( e ) {

    e.preventDefault();

    if ( typeof e.keyCode == 'undefined' || e.keyCode == 13 ) {

      this.props.onChange( this.props.value );

    }

  },

  renderSpinner: function () {

    return <Spinner
      loading={true}
      spinner={{ width: 1, length: 3, radius: 4, color: '#666' }}
    />

  },

  render: function () {

    return <div className={this.props.dynamic ? 'search-field' : 'search-field input-group' }>
      <label className="sr-only" htmlFor={this.props.name}>{this.props.label}</label>
      <input
        placeholder={this.props.placeholder}
        type="text"
        className="form-control"
        onChange={this.onChange}
        onFocus={this.onFocus}
        onKeyUp={this.onCommit}
        value={this.props.value || ''} />
      <span className="input-group-btn">
        <button
          className="btn btn-default"
          type="button"
          onClick={this.onCommit}>
          { this.props.loading ? this.renderSpinner() : null }
          <i style={this.props.loading ? { visibility: 'hidden' } : {}} className="fa fa-search"></i>
        </button>
      </span>

    </div>

  }

} );
