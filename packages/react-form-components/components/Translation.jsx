"use strict";

import React, { PropTypes } from 'react';

import languages from 'languages';

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
      languages: [ 'de', 'en', 'es', 'it' ],
      labels: {
        translationTitle: 'Translation',
        sourceLanguage: 'Source Language',
        targetLanguages: 'Automatic translation',
        translationHelp: 'Find out more'
      },
      helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/213573709-Traduction-automatique-des-%C3%A9v%C3%A9nements'
    }

  },

  render() {

    const labels = this.props.labels;

    return <div className="form-group">
      <a className="pull-right" target="_blank" href={this.props.helpLink}>{labels.translationHelp}</a>
      <h2>{labels.translationTitle}</h2>
      <div className="form-inline row">
        <div className="col-sm-6">
          <label>{labels.sourceLanguage}</label>
          <div>
            <span className="disabled">{languages.getLanguageInfo( this.props.source ).nativeName}</span>
          </div>
        </div>
        <div className="col-sm-6">
          <label>{labels.targetLanguages}</label>
          <ul className="list-unstyled">
            { this.props.languages.map( l => <li key={l} className="checkbox margin-right-sm">
              <label>
                <input 
                  type="checkbox"
                  onChange={ e => this.props.checked.indexOf( l ) !== -1 ? this.props.uncheck( l ) : this.props.check( l ) }
                  checked={this.props.checked.indexOf( l )!==-1} />
                  {l.toUpperCase()}
              </label>
            </li> ) }
          </ul>
        </div>
      </div>
    </div>

  }

} );