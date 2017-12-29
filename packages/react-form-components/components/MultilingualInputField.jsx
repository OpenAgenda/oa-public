"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

makeLabelGetter = require( '../lib/makeLabelGetter' ),

labels = require( '../labels' ),

utils = require( '@openagenda/utils' );

module.exports = createReactClass( {

  displayName: 'MultilingualInputField',

  propTypes: {

    // enabled boolean
    enabled: PropTypes.array,
    
    // list of language codes to display
    languages: PropTypes.array,

    // language-indexed values. ex: { fr: 'v1', en: 'v2' }
    value: PropTypes.object,

    // used by component to load labels
    getLabel: PropTypes.func,

    // used to optionnally bypass getLabel and load main label as is
    label: PropTypes.string,

    // used to optionnally bypass getLabel and load info as is
    info: PropTypes.string,

    // used to optionnally bypass getLabel and load placeholder as is
    placeholder: PropTypes.string,

    // called when value changes
    onChange: PropTypes.func,

    // rows to display if field is textarea
    rows: PropTypes.number,

    // type of the field. either text or textarea
    type: PropTypes.string,

    // bottom is a component generator that takes a lang
    bottom: PropTypes.func

  },

  getDefaultProps() {

    return {
      type: 'text',
      getLabel: makeLabelGetter( labels ),
      bottom: () => null
    }

  },

  onChange( lang ) {

    return e => {

      var newValue = JSON.parse( JSON.stringify( this.props.value ) );

      newValue[ lang ] = e.target.value;

      this.props.onChange( this.props.name, newValue );

    }

  },

  renderField( lang ) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;

    return <div>

    { this.props.type == 'textarea' ? <textarea
      name={name}
      rows={this.props.rows}
      placeholder={this.props.getLabel( this.props.placeholder ) || this.props.placeholder }
      value={this.props.value[lang]}
      className="form-control"
      onChange={this.onChange( lang )}
      disabled={!this.isEnabled( lang )} />

    : <input
        name={name}
        type="text"
        placeholder={this.props.getLabel( this.props.placeholder ) || this.props.placeholder }
        value={this.props.value[lang]}
        className="form-control"
        onChange={this.onChange( lang )} 
        disabled={!this.isEnabled( lang )} /> }

    { this.props.bottom( lang ) }

    </div>

  },

  isEnabled( lang ) {

    if ( !utils.isArray( this.props.enabled ) ) return true;

    return this.props.enabled.indexOf( lang ) !== -1;

  },

  renderLanguageBlock( lang ) {

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

  render() {

    let classes = [ 'multilingual-input-field', 'form-group' ];

    if ( this.props.enabled && !this.props.enabled.length ) {

      classes.push( 'disabled' );

    }

    return <div className={classes.join( ' ' )}>
      <label>{this.props.label || this.props.getLabel( this.props.name )}</label>
      { this.props.info ? <span className="info">{this.props.getLabel( this.props.info ) || this.props.info }</span> : null }
      <ul className="list-unstyled">
      {this.props.languages.map( lang => {
        return <li key={lang} className={this.isEnabled( lang ) ? '' : 'disabled'}>
          {this.renderLanguageBlock( lang )}
        </li>
      } )}
      </ul>
    </div>

  }

} );