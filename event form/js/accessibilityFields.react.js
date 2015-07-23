"use strict";

var React = require( 'react'),

rUtils = require( './reactUtils.js' ),

defaults = {
  canvas: '.js_form_canvas',
  events: {
    send: 'eaccessibilitysend'
  }
};

module.exports = function( options ) {

  var params = rUtils.extend( {
    values: []
  }, defaults, options );

  React.render(
    <AccessibilityFields 
      init={params.values}
      lang={params.lang}
      onChange={rUtils.ehUpdate( params.events.send )} />,
    rUtils.createCanvas( rUtils.el( params.canvas ) )
  );

}

var AccessibilityFields = React.createClass({

  labels: {
    title: {
      en: 'Particular accessibility',
      fr: 'Accessibilité particulière'
    }
  },

  types: [{
    code: 'mi',
    label: {
      en: 'motor impairment',
      fr: 'handicap moteur'
    }
  }, {
    code: 'hi',
    label: {
      en: 'hearing impairment',
      fr: 'handicap auditif'
    }
  },{
    code: 'pi',
    label: {
      en: 'mental impairment',
      fr: 'handicap psychique'
    }
  },{
    code: 'vi',
    label: {
      en: 'visual impairment',
      fr: 'handicap visuel'
    }
  }, { 
    code: 'sl', 
    label: {
      en: 'sign language',
      fr: 'language des signes'
    }
  }],

  getInitialState: function() {

    return {
      checked: this.props.init ? this.props.init : []
    }

  },

  onChange: function( e ) {

    this.updateState( e.target.value, e.target.checked );

  },

  updateState: function( code, checked ) {

    var current = this.state.checked;

    if ( checked ) {

      if ( current.indexOf( code ) == -1 ) {

        current.push( code );

      }

    } else {

      current = current.filter( function( c ) {

        return c !== code;

      });

    }

    this.setState( { checked: current } );

  },

  componentDidUpdate: function() {

    this.props.onChange( this.state.checked );

  },

  render: function() {

    var self = this;

    return (
      <ul className="cform">
        <li>
          <label>{this.labels.title[this.props.lang]}</label>
        </li>
        {this.types.map(function(type, idx){
          return <AccessibilityItem 
            key={idx}
            label={type.label[self.props.lang]}
            checked={self.state.checked.indexOf(type.code)!==-1}
            code={type.code}
            onChange={self.onChange}
          />;
        })}
      </ul>
    );

  }

}),

AccessibilityItem = React.createClass({

  render: function(){

    return (
      <li className="line">
        <input 
          type="checkbox"
          value={this.props.code} 
          checked={this.props.checked}
          onChange={this.props.onChange}
        />
        <label>{this.props.label}</label>
      </li>
    );

  }

});