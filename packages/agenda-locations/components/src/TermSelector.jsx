import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import xhr from 'xhr';
import Select from 'react-select';

module.exports = createReactClass( {

  propTypes: {

    // interface language
    lang: PropTypes.string,

    // currently selected term
    //value: PropTypes.obj,

    // field from which to extract terms
    // for more than one field, comma-separate.
    field: PropTypes.string.isRequired,

    // ressource to fetch terms
    res: PropTypes.string,

    // callback to go to when change is made
    onChange: PropTypes.func,

  },

  getDefaultProps: function () {

    return {
      lang: 'en'
    }

  },

  getInitialState: function () {

    return {
      terms: []
    }

  },

  componentWillReceiveProps: function ( nextProps ) {

    if ( this.props.field == nextProps.field ) return;

    this.setState( { terms: [] } );

  },

  componentDidUpdate: function ( prevProps, prevState ) {

    if ( this.props.field == prevProps.field ) return;

    this.fetchTerms();

  },

  componentDidMount: function () {

    this.fetchTerms();

  },

  fetchTerms: function () {

    var self = this;

    xhr( {
      json: true,
      uri: this.props.res + '?field=' + this.props.field,
    }, function ( err, result ) {

      if ( err ) return;

      var firstTerm = self.props.field.split( ',' )[ 0 ],

        sortedTerms = result.body.terms.sort( function ( a, b ) {

          if ( a[ firstTerm ] > b[ firstTerm ] ) {

            return 1;

          }

          if ( a[ firstTerm ] < b[ firstTerm ] ) {

            return -1;

          }

          // a must be equal to b
          return 0;

        } );

      self.setState( {
        terms: sortedTerms
      } );

    } );

  },

  onChange: function ( index ) {

    this.props.onChange( this.state.terms[ index ] );

  },

  getTermIndex: function ( value ) {

    if ( !value ) return null;

    return this.state.terms.findIndex( t => {

      let found = false;

      for ( var k in t ) {

        if (
          ![ 'country', 'countryCode' ].includes( k )
          && (typeof value === 'string' ? value : value[ k ]) === t[ k ]
        ) {

          found = true;

        }

      }

      return found;

    } );

  },

  termOption: function ( term, index ) {

    var option = {
        value: index,
        label: ''
      },

      labelParts = [],

      self = this;

    this.props.field.split( ',' ).forEach( function ( field ) {

      // country is specific as it is multilingual
      if ( field == 'country' ) {

        labelParts.push( _.get( term.country, self.props.lang, term.country[ _.first( _.keys( term.country ) ) ] ) );

      } else {

        labelParts.push( term[ field ] );

      }

    } );

    option.label = labelParts.join( ', ' );

    return option;

  },

  render: function () {

    var self = this;

    return <div className="terms-selector">
      <Select
        value={this.getTermIndex( this.props.value ) || this.props.value }
        placeholder={this.props.placeholder || null }
        options={this.state.terms.map( function ( t, i ) {
          return self.termOption( t, i )
        } )}
        onChange={value => this.onChange( value ? value.value : value )}
        clearable={true} />
    </div>

  }

} )
