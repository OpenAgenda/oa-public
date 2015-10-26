"use strict";

var Select = require( 'react-select' ),

React = require( 'react' ),

rUtils = require( './reactUtils.js' ),

defaults = {
  canvas: '.js_form_canvas',
  events: {
    send: 'eagesend'
  }
};

module.exports = React.createClass({

  labels: {
    year: {
      fr: 'an',
      en: 'year'
    },
    years: {
      fr: 'ans',
      en: 'years'
    },
    min: {
      fr: 'De',
      en: 'From'
    },
    max: {
      fr: 'à',
      en: 'to'
    }
  },

  getInitialState: function() {

    var enabled = false;

    if ( this.props.value && this.props.value.min !== undefined && this.props.value.min !== null ) {

      enabled = true;

    }

    return {
      enabled: enabled,
    }

  },

  onChange: function( attr ) {

    var self = this;

    return function( e ) {

      var current = JSON.parse( JSON.stringify( self.props.value ) );

      current[ attr ] = parseInt( e, 10 );

      if ( current.min && current.min > self.props.value.max ) {

        current.max = current.min;

      }

      self.props.onChange( current );

    }

  },

  onEnabled: function( enable ) {

    var self = this;

    return function() {

      if ( typeof enable == 'undefined' ) {

        enable = !self.state.enabled;

      }

      var min = self.props.value ? self.props.value.min || null : null,

      max = self.props.value ? self.props.value.max || null : null;

      if ( enable && min === null ) {

        min = 0;

      }

      if ( enable && max === null ) {

        max = 99;

      }

      self.props.onChange( {
        min: min,
        max: max
      } );

      self.setState( {
        enabled: enable
      });

    }

  },

  /**
   * get or build select menu options based on propped language
   */
  
  getSelectOptions: function( minValue ) {

    this.selectOptions = [];

    if ( typeof minValue == 'undefined' ) {

      minValue = 0;

    }

    for ( var i=0; i<100; i++ ) {

      if ( minValue <= i ) {
      
        this.selectOptions.push( {
          value: i + '',
          label: i + ' ' + ( i < 2 ? this.labels.year : this.labels.years )[ this.props.labelsLang ]
        } );

      }

    }

    return this.selectOptions;

  },

  render: function() {

    var min = null, max = null;

    if ( this.state.enabled ) {

      min = this.props.value.min;

      min = ( min !== undefined && min !== null ) ? min + '' : '';

      max = this.props.value.max;

      max = ( max !== undefined && max !== null ) ? max + '' : '';

    }

    return ( 
      <div className="cform target-age">
        <ul>
          <li className="line">
            <input type="checkbox" name="age" checked={this.state.enabled} onClick={this.onEnabled(!this.state.enabled)} />
            <label onClick={this.onEnabled()}>{this.props.label[this.props.labelsLang]}</label> - 
            <label onClick={this.onEnabled()} for="minage">{this.labels.min[this.props.labelsLang]}</label>
            <Select
              name="minage"
              value={min}
              options={this.getSelectOptions()}
              clearable={false}
              onChange={ this.onChange( 'min' ) }
              onFocus={this.onEnabled(true)}
            />
            <label for="maxage">{this.labels.max[this.props.labelsLang]}</label>
            <Select
              name="maxage"
              value={max}
              options={this.getSelectOptions( this.props.value ? min : false )}
              clearable={false}
              onChange={ this.onChange( 'max') }
              onFocus={this.onEnabled(true)}
            />
          </li>
        </ul>
      </div>
    );

  }

});