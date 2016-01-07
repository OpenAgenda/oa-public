"use strict";

var React = require( 'react' );

module.exports = React.createClass( {

  propTypes: {
    
    // list of language codes to display
    languages: React.PropTypes.array,

    // language-indexed values. ex: { fr: 'v1', en: 'v2' }
    value: React.PropTypes.object,

    // used by component to load labels
    getLabel: React.PropTypes.func,
    
    // called when value changes
    onChange: React.PropTypes.func,

    // rows to display if field is textarea
    rows: React.PropTypes.number,

    // type of the field. either text or textarea
    type: React.PropTypes.string

  },

  getDefaultProps: function() {

    return {
      type: 'text'
    }

  },

  onChange: function() {

  },

  renderField: function( lang ) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;

    if ( this.props.type == 'textarea' ) {

      return <textarea
        name={name}
        rows={this.props.rows}
        value={this.props.value[lang]}
        className="form-control"
        onChange={this.onChange( lang )} />

    } else {

      return <input
        name={name}
        type="text"
        value={this.props.value[lang]}
        className="form-control"
        onChange={this.onChange( lang )} />

    }

  },

  renderLanguageBlock: function( lang ) {

    if ( this.props.languages.length > 1 ) {

      return <div className="lang-unit">
        <label>{lang}</label>
        <div>
          {this.renderField( lang )}
        </div>
      </div>

    } else {

      return this.renderField( lang );

    }

  },

  render: function() {

    var self = this;

    return <div className="multilingual-input-field form-group">
      <label>{this.props.getLabel( this.props.name )}</label>
      <ul className="list-unstyled">
      {this.props.languages.map( function( lang ) {
        return <li key={lang}>
          {self.renderLanguageBlock( lang )}
        </li>
      } )}
      </ul>
    </div>

  }

} );