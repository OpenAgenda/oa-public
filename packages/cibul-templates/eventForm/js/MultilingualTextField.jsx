"use strict";

const _ = require( 'lodash' );

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

validators = require( './validators' ),

utils = require( '@openagenda/utils' ),

renderHelpers = require( './renderHelpers.jsx' );

module.exports = createReactClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  componentDidMount: function() {

    var value = this.props.value;

    if ( utils.isArray( value ) ) value = false;

    value = value ? value : this.convertToMultilingual( value );

    // must run validator on init or else form is considered valid
    // this is not enough as it does not take into account
    // subsequent added languages
    this.props.onChange( value, this.validate( value ) );

  },

  componentWillReceiveProps: function( newProps ) {

    var self = this;

    if ( newProps.languages.filter( function( l ) {

      return self.props.languages.indexOf( l ) == -1;

    }).length ) {

      // a language was added
      this.props.onChange( newProps.value, this.validate( newProps.value, newProps.languages ) );

    }

  },

  convertToMultilingual: function( v ) {

    var m = {};

    utils.forEach( this.props.languages, function( language ) {

      m[ language ] = v;

    });

    return m;

  },

  onChange: function( l ) {

    var self = this;

    return function( e ) {

      var value = JSON.parse( JSON.stringify( self.props.value || {} ) );

      value[ l ] = _.trimStart( e.target.value );

      self.setState( { userHasTyped: true } );

      self.props.onChange( value, self.validate( value ), [ l ] );

    }

  },

  renderBlock: renderHelpers.multilingual.block,

  renderField: function( value, l ) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + l : this.props.name;

    if ( this.props.type !== 'textarea' ) {

      return <input
        placeholder={ this.props.placeholder ? this.props.placeholder[ this.props.lang ] : '' }
        name={name}
        type="text"
        value={ value }
        className="form-control"
        onChange={ this.onChange( l ) } />

    } else {

      return <textarea
        placeholder={ this.props.placeholder ? this.props.placeholder[ this.props.lang ] : '' }
        name={name}
        rows={ this.props.rows }
        value={ value }
        className="form-control"
        onChange={ this.onChange( l ) } />

    }

  },

  renderError: renderHelpers.multilingual.error,

  render: renderHelpers.multilingual.render,

  validate: validators.validate

});
