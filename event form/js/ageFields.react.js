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

module.exports = function( options ) {

  var params = rUtils.extend( {}, defaults, options ),

  values = JSON.parse( params.values );

  React.render(
    <AgeFields initMin={values.min} initMax={values.max} lang={params.lang} onChange={rUtils.ehUpdate( params.events.send )} />,
    rUtils.createCanvas( rUtils.el( params.canvas ) )
  );

}


var AgeFields = React.createClass({

  labels: {
    year: {
      fr: 'an',
      en: 'year'
    },
    years: {
      fr: 'ans',
      en: 'years'
    },
    title: {
      fr: 'Age du public ciblé',
      en: 'Targeted public age'
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

    return {
      enabled: this.props.initMin || this.props.initMax,
      min: this.props.initMin===null ? '' : this.props.initMin,
      max: this.props.initMax===null ? '' : this.props.initMax
    }

  },

  onChange: function( attr ) {

    var self = this;

    return function( e ) {

      self.updateState( attr, e );

    }

  },

  onEnabled: function( enable ) {

    var self = this;

    return function() {

      if ( typeof enable == 'undefined' ) {

        enable = !self.state.enabled;

      }

      var min = self.state.min, 

      max = self.state.max;

      if ( enable && min.length == 0 ) {

        min = 0;

      }

      if ( enable && max.length == 0 ) {

        max = 99;

      }

      self.updateState( {
        enabled: enable,
        min: min,
        max: max
      } );

    }

  },

  updateState: function( key, newValue ) {

    var changes = {};

    if ( arguments.length == 1 ) {

      changes = key;

    } else {

      changes[ key ] = newValue;

    }

    if ( changes.min && changes.min > this.state.max ) {

      changes.max = changes.min;

    }

    this.setState( changes );

  },

  componentDidUpdate: function() {

    this.props.onChange( {
      min: this.state.enabled ? this.state.min : null,
      max: this.state.enabled ? this.state.max : null
    } );

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
          label: i + ' ' + ( i < 2 ? this.labels.year : this.labels.years )[ this.props.lang ]
        } );

      }

    }

    return this.selectOptions;

  },

  render: function() {

    return ( 
      <div className="cform">
        
        <ul>
          <li className="line">
            <input type="checkbox" name="age" value="1" checked={this.state.enabled} onClick={this.onEnabled(!this.state.enabled)} />
            <label onClick={this.onEnabled()}>{this.labels.title[this.props.lang]}</label> - 
            <label onClick={this.onEnabled()} for="minage">{this.labels.min[this.props.lang]}</label>
            <Select
              name="minage"
              value={this.state.enabled ? this.state.min + '' : ''}
              options={this.getSelectOptions()}
              clearable={false}
              onChange={ this.onChange( 'min' ) }
              onFocus={this.onEnabled(true)}
            />
            <label for="maxage">{this.labels.max[this.props.lang]}</label>
            <Select
              name="maxage"
              value={this.state.enabled ? this.state.max + '' : ''}
              options={this.getSelectOptions( this.state.min )}
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