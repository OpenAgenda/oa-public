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

    var init = this.props.init ? this.props.init : [];

    return {
      enabled: !!init.length,
      checked: init
    }

  },

  onEnabled: function( e ) {

    this.setState( {
      enabled: !this.state.enabled
    } );

  },

  onClick: function( type ) {

    var self = this;

    return function() {

      self.toggleState( type.code );

    }

  },

  toggleState: function( code ) {

    var current = this.state.checked,

    codeIndex = current.indexOf( code );

    if ( codeIndex == -1 ) {

      current.push( code );

    } else {

      current.splice( codeIndex, 1 );

    }

    this.setState( { checked: current } );

  },

  componentDidUpdate: function() {

    var checkedItems = this.state.enabled ? this.state.checked : [];



    this.props.onChange( checkedItems );

  },

  render: function() {

    var self = this;

    return (
      <div className="cform">
        <ul>
          <li className="line" onClick={self.onEnabled}>
            <input type="checkbox" name="accessibility" checked={self.state.enabled} />
            <label>{this.labels.title[this.props.lang]}</label>
          </li>
        </ul>
        <ul className="acc">
          {this.types.map(function(type, idx){
            return <AccessibilityItem 
              key={idx}
              label={type.label[self.props.lang]}
              checked={self.state.checked.indexOf(type.code)!==-1}
              code={type.code}
              onClick={self.onClick( type )}
              enabled={self.state.enabled}
            />;
          })}
        </ul>
      </div>
    );

  }

}),

AccessibilityItem = React.createClass({

  render: function(){

    return (
      <li className={this.props.enabled ? 'line' : 'display-none'} onClick={this.props.onClick}>
        <input 
          type="checkbox"
          value={this.props.code} 
          checked={this.props.checked}
        />
        <div className={'ill ' + this.props.code}></div>
        <label>{this.props.label}</label>
      </li>
    );

  }

});