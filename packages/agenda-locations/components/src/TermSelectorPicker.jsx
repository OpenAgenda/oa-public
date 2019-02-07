import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import TermSelector from './TermSelector';
import Select from 'react-select';

module.exports = createReactClass( {

  propTypes: {

    value: PropTypes.object,

    lang: PropTypes.string,

    fields: PropTypes.object,

    // field showing by default
    defaultField: PropTypes.string,

    res: PropTypes.string,

    // labels for the field listed
    labels: PropTypes.object,

    onChange: PropTypes.func

  },

  /**
   * get field currently selected
   * should be the last ( smallest ) of possibles
   * that has a value set
   */
  getField: function() {

    var possibles = Object.keys( this.props.fields );

    for (var i = possibles.length - 1; i >= 0; i--) {

      if ( this.props.value[ possibles[i] ] !== undefined ) {

        return possibles[ i ];

      }

    }

    return this.props.defaultField || possibles[ possibles.length -1 ];

  },

  getFieldValue: function() {

    return this.props.fields[ this.getField() ];

  },

  getDefaultProps: function() {

    return {
      lang: 'en'
    }

  },

  getFieldOptions: function() {

    var self = this;

    return Object.keys( this.props.fields )

    .map( function( f ) {

      let label = self.props.labels[ f ];

      return {
        value: f,
        label: _.get( label, self.props.lang, label[ _.first( _.keys( label ) ) ] )
      }

    } )

  },

  onChangeField: function( field ) {

    var value = {};

    value[ field ] = null;

    this.props.onChange( value );

  },

  onChange: function( value ) {

    var clean = {};

    this.getFieldValue().split( ',' ).forEach( function( f ) {

      clean[ f ] = ( value || {} )[ f ] || '';

    } );

    this.props.onChange( clean );

  },

  render: function() {

    return <div className="picked-terms-selector">
      <Select
        value={ this.getField() }
        options={ this.getFieldOptions() }
        onChange={ value => this.onChangeField( value ? value.value : value ) }
        autoBlur={ true }
        clearable={ false }
        searchable={ false } />
      <TermSelector
        res={ this.props.res }
        lang={ this.props.lang }
        field={ this.getFieldValue() }
        value={ this.props.value[ this.getField() ] }
        onChange={ this.onChange }
      />
    </div>

  }

} );
