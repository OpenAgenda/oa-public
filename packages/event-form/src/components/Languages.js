import _ from 'lodash';
import React, { Component } from 'react';
import Select from 'react-select';
import languages from 'languages';

import flattenLabels from '@openagenda/labels/flatten';
import languageLabels from '@openagenda/labels/event/form';

import languageCodesAndLabels from '../utils/languageCodesAndLabels';
import showRemoveAction from '../utils/showRemoveAction';

module.exports = class Languages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adding: false,
      changing: false
    };
  }

  onAddSelectStart() {
    this.setState({ adding: true });
  }

  onChangeStart() {
    if ( this.props.value.length !== 1 ) return;

    this.setState({ changing: true });
  }

  onChange(l) {
    this.props.onChange([l.value]);

    this.setState({ changing: false });
  }

  onCancelChange() {
    this.setState({ changing: false });
  }

  onRemove(l) {
    this.props.onChange( this.props.value.filter( current => current !== l ) );
  }

  onAdd(l) {
    this.props.onChange( this.props.value.concat( l.value ) );

    this.setState({ adding: false });
  }

  getRemainingLanguages() {
    return languageCodesAndLabels
      .filter( l => !this.props.value.includes( l.value ) );
  }

  render() {
    const pickedLanguages = this.props.value;

    const labels = flattenLabels( languageLabels, this.props.lang );

    const { strict, required } = this.props.field;

    return <div className="language-bar">
      { !this.state.changing ? <ul>
        {pickedLanguages.map( l => <li key={'language-' + l} onClick={this.onChangeStart.bind( this )}>
          <div className="language-item">
            <span>{languages.getLanguageInfo(l).nativeName}</span>
            {showRemoveAction({ strict, pickedLanguages, required }, l) ? <span className="remove" onClick={this.onRemove.bind(this, l)}>&#10005;</span> : null}
            {!strict && pickedLanguages.length === 1 && <span className="margin-right-xs"><i className="fa fa-angle-down"></i></span>}
          </div>
        </li>)}
      </ul> : null }
      { !strict && !this.state.adding && !this.state.changing ? <span className="language-add">
        <a onClick={this.onAddSelectStart.bind( this )}>{labels.addLanguage}</a>
      </span> : null }
      { this.state.adding && <span className="language-add">
        <Select
          placeholder={labels.selectLanguage}
          options={this.getRemainingLanguages()}
          onChange={this.onAdd.bind( this )}
          classNamePrefix="language-select"
          clearable={false}
        />
      </span> }
      { this.state.changing && <Select
        placeholder={labels.selectLanguage}
        value={_.first(
          languageCodesAndLabels
            .filter( c => _.first( pickedLanguages ) === c.value )
        ) }
        options={this.getRemainingLanguages()}
        onChange={this.onChange.bind( this )}
        className="change-select margin-right-sm"
        clearable={false}
      /> }
      { this.state.changing && <span className="change-cancel">
        <a onClick={this.onCancelChange.bind( this )}>{labels.cancelLanguageChange}</a>
      </span> }
    </div>
  }
}
