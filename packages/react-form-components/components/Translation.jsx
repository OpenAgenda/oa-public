"use strict";

import React, { PropTypes } from 'react';
import languages from 'languages';
import Select from 'react-select';

const Translation = props => ( <TranslationComponent {...props} /> );

export default Translation;

Translation.propTypes = {
  source: PropTypes.string,
  languages: PropTypes.array,
  labels: PropTypes.object,
  checked: PropTypes.array,
  check: PropTypes.func,
  uncheck: PropTypes.func,
  helpLink: PropTypes.string
}

const TranslationComponent = React.createClass( {

  getDefaultProps() {

    return {
      source: 'fr',
      sets: [ {
        source: 'fr',
        target: [ 'de', 'en', 'es', 'it' ],
        checked: []
      } ],
      labels: {
        translationTitle: 'Translation',
        sourceLanguage: 'Source Language',
        targetLanguages: 'Automatic translation',
        translationHelp: 'Find out more',
        sourceChange: 'Choose'
      },
      helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/213573709-Traduction-automatique-des-%C3%A9v%C3%A9nements',
      check: () => {},
      uncheck: () => {},
      sourceChange: () => {}
    }

  },

  getInitialState() {

    return {
      editingSource: false
    }

  },

  sourceChange( e ) {

    e.preventDefault();

    this.setState( { editingSource: true } );

  },

  updateSource( newSource ) {

    this.setState( {
      editingSource: false
    } );

    this.props.sourceChange( newSource );

  },

  render() {

    const labels = this.props.labels;

    return <div className="form-group translation-form">
      <a className="pull-right help" target="_blank" href={this.props.helpLink}>
        <i className="fa fa-question-circle"></i>
        <label style={{display:'none'}}>{labels.translationHelp}</label>
    </a>
      <h2>{labels.translationTitle}</h2>
      <div className="form-inline row">
        <div className="col-sm-6">
          <label>{labels.sourceLanguage}</label>
          { this.state.editingSource ? 
          <div>
            <Select
              value={this.props.source}
              options={this.props.sets.map( s => ({
                value: s.source,
                label: languages.getLanguageInfo( s.source ).nativeName
              }))}
              onChange={this.updateSource}
              clearable={false} />
          </div> :
          <div className="line">
            <span className="disabled">{languages.getLanguageInfo( this.props.source ).nativeName}</span>
            {this.props.sets.length > 1 ?<span> - <a href="#" onClick={this.sourceChange}>{labels.sourceChange}</a></span> : null }
          </div> }
        </div>
        <div className="col-sm-6">
          <label>{labels.targetLanguages}</label>
          <ul className="list-unstyled line">
            { this.props.sets.filter( s => s.source === this.props.source ).map( s => s.target.map( l => 
              <li key={l} className="checkbox margin-right-sm">
                <label>
                  <input 
                    type="checkbox"
                    onChange={ e => s.checked.indexOf( l ) !== -1 ? this.props.uncheck( s.source, l ) : this.props.check( s.source, l ) }
                    checked={s.checked.indexOf( l )!==-1} />
                    {l.toUpperCase()}
                </label>
              </li> ) ) }
          </ul>
        </div>
      </div>
    </div>

  }

} );