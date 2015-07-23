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
      onlyMin: !this.props.initMax,
      min: this.props.initMin,
      max: this.props.initMax
    }

  },

  onChange: function( attr ) {

    var self = this;

    return function( e ) {

      self.updateState( attr, e );

    }

  },

  onModeChange: function( e ) {

    var onlyMin = e.target.value == 'onlyMin';

    this.updateState( {
      onlyMin: onlyMin,
      max: onlyMin ? null : this.state.max
    } );

  },

  updateState: function( key, newValue ) {

    var changes = {};

    if ( arguments.length == 1 ) {

      changes = key;

    } else {

      changes[ key ] = newValue;

    }

    if ( changes.min && changes.min > this.state.max ) {

      changes.max = null;

    }

    this.setState( changes );

  },

  componentDidUpdate: function() {

    this.props.onChange( {
      min: this.state.min,
      max: this.state.max
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
        <label>{this.labels.title[this.props.lang]}</label>
        <ul>
          <li className="line">
            
            <input type="radio" name="age_mode" value="onlyMin" checked={this.state.onlyMin} onChange={this.onModeChange} />
            <label for="age">{this.labels.min[this.props.lang]}</label>
            <Select
              name="age"
              value={this.state.onlyMin ? this.state.min : ''}
              options={this.getSelectOptions()}
              clearable={false}
              onChange={ this.onChange( 'min' ) }
              disabled={ !this.state.onlyMin }
            />
            
          </li>
          <li className="line">

            <input type="radio" name="age_mode" checked={!this.state.onlyMin} onChange={this.onModeChange} />
            <label for="minage">{this.labels.min[this.props.lang]}</label>
            <Select
              name="minage"
              value={this.state.onlyMin ? '' : this.state.min}
              options={this.getSelectOptions()}
              clearable={false}
              onChange={ this.onChange( 'min' ) }
              disabled={this.state.onlyMin}
            />
            <label for="maxage">{this.labels.max[this.props.lang]}</label>
            <Select
              name="maxage"
              value={this.state.onlyMin ? '' : this.state.max}
              options={this.getSelectOptions( this.state.min )}
              clearable={false}
              onChange={ this.onChange( 'max') }
              disabled={this.state.onlyMin}
            />
          </li>
          
        </ul>
      </div>
    );

  }

});