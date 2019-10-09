import React from 'react';
import ReactDom from 'react-dom';
import createReactClass from 'create-react-class';
import Select from 'react-select';
import rUtils from './reactUtils.js';

const defaults = {
  canvas: '.js_form_canvas',
  events: {
    send: 'etypesend'
  }
};

module.exports = function( options ) {

  var params = rUtils.extend( {}, defaults, options );

  ReactDom.render(
    <TypeField initType={params.code} lang={params.lang} onChange={rUtils.ehUpdate( params.events.send )} />,
    rUtils.createCanvas( rUtils.el( params.canvas ) )
  );

}


var TypeField = createReactClass({

  labels: {
    label: {
      en: 'Type of the event',
      fr: 'Type de l\'événement'
    }
  },

  types: [{
    code: 'cn',
    label: {
      en: 'Concert',
      fr: 'Concert'
    }
  }, {
    code: 'ex',
    label: {
      en: 'Exhibition',
      fr: 'Exposition'
    }
  }, {
    code: 'th',
    label: {
      en: 'Theater',
      fr: 'Théâtre'
    }
  }, {
    code: 'ot',
    label: {
      en: 'Other',
      fr: 'Autre'
    }
  }],

  getInitialState: function() {

    return {
      type: this.props.initType
    }

  },

  onChange: function( newType ) {

    this.setState( {
      type: newType.value
    });

  },

  componentDidUpdate: function() {

    this.props.onChange(this.state.type);

  },

  getSelectOptions: function() {

    var self = this;

    return this.types.map( function( m ) {

      return {
        label: m.label[ self.props.lang ],
        value: m.code
      }

    });

  },

  render: function() {

    const options = this.getSelectOptions();
    const value = options.find(option => option.value === this.state.type);

    return (
      <ul className="cform">
        <li>
          <label htmlFor="type">{this.labels.label[ this.props.lang ]}</label>
          <div>
            <Select
              name="type"
              options={options}
              value={value}
              clearable={false}
              onChange={this.onChange}
            />
          </div>
        </li>
      </ul>
    )

  }

});
