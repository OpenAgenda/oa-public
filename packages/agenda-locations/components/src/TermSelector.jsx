import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import xhr from 'xhr';
import Select from 'react-select';

export default createReactClass( {

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

  getDefaultProps() {

    return {
      lang: 'en'
    }

  },

  getInitialState() {

    return {
      terms: []
    }

  },

  componentWillReceiveProps({field}) {

    if ( this.props.field == field ) return;

    this.setState( { terms: [] } );

  },

  componentDidUpdate({field}, prevState) {

    if ( this.props.field == field ) return;

    this.fetchTerms();

  },

  componentDidMount() {

    this.fetchTerms();

  },

  fetchTerms() {

    const self = this;

    xhr( {
      json: true,
      uri: `${this.props.res}?field=${this.props.field}`,
    }, (err, {body}) => {
      if ( err ) return;

      const firstTerm = self.props.field.split( ',' )[ 0 ];

      const sortedTerms = body.terms.sort( (a, b) => {

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

  onChange(index) {

    this.props.onChange( this.state.terms[ index ] );

  },

  getTermIndex(value) {

    if ( !value ) return null;

    return this.state.terms.findIndex( t => {

      let found = false;

      for ( const k in t ) {

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

  termOption(term, index) {
    const option = {
      value: index,
      label: ''
    };

    const labelParts = [];
    const self = this;

    this.props.field.split( ',' ).forEach( field => {

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

  render() {

    const self = this;

    return (
      <div className="terms-selector">
        <Select
          value={this.getTermIndex( this.props.value ) || this.props.value }
          placeholder={this.props.placeholder || null }
          options={this.state.terms.map( (t, i) => self.termOption( t, i ) )}
          onChange={value => this.onChange( value ? value.value : value )}
          clearable={true} />
      </div>
    );

  }

} );
