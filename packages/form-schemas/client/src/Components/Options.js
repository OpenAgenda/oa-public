import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import getPreferredLang from '../lib/getPreferredLang';
import labels from '../lib/builderLabels';
import OptionAdd from './OptionAdd';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

const getLabel = makeLabelGetter( labels );

export default class OptionsField extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      toAdd: _.get( props, 'field.languages', [] ).length ? {} : ''
    }

  }

  addOption( newOption ) {

    this.props.onChange( ( this.props.value || [] ).concat( newOption ) );

  }

  renderOption( o ) {

    const { lang } = this.props;

    return <div>
      <span>{getPreferredLang( o.label, lang )}</span>
      <button className="btn btn-link">{getLabel( 'optionEdit', lang )}</button>
    </div>

  }

  renderAdd() {

    const { field, lang } = this.props;

    return <OptionAdd
      current={this.props.value}
      onAdd={this.addOption.bind( this )}
      lang={lang}
      languages={field.languages}
    />

  }

  render() {

    const { field, error, value } = this.props;

    const languages = field.languages;

    const options = value || [];

    return <div>
      { options.length ? <ul className="list-unstyled">
        {options.map( o => <li key={'option-' + o.value}>{this.renderOption( o )}</li> )}
      </ul> : null }
      {this.renderAdd()}
    </div>

  }

}
