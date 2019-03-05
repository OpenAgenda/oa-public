import _ from 'lodash';
import classNames from 'classnames';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import getPreferredLang from '../lib/getPreferredLang';
import labels from '../lib/builderLabels';
import OptionLabelsForm from './OptionLabelsForm';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

const getLabel = makeLabelGetter( labels );

const modes = {
  ADDING: 0,
  EDITING: 1
}

export default class OptionsField extends Component {

  constructor( props ) {

    super( props );

    const state = {
      mode: null,
      editedIndex: null
    }

    if ( props.field.devInitState ) _.assign( state, props.field.devInitState );

    this.state = state;

  }

  setMode( newMode ) {

    this.setState( { mode: newMode } );

  }

  addOption( newOption ) {

    this.props.onChange( ( this.props.value || [] ).concat( newOption ) );

  }

  editOption( index ) {

    this.setState( { mode: modes.EDITING, editedIndex: index } );

  }

  updateOption( index, option ) {

    const options = this.props.value;

    const optionWithId = _.assign( { id: options[ index ].id }, option );

    this.props.onChange( _.set( options, index, optionWithId ) );

    this.setState( { mode: null } );

  }

  renderOption( index, option ) {

    const { lang } = this.props;

    const isEdited = ( this.state.mode === modes.EDITING ) && ( index === this.state.editedIndex );

    return <div>
      { isEdited ? null : <label className="margin-v-xs">{getPreferredLang( option.label, lang )}</label> }
      { this.state.mode === modes.EDITING ? null : <div className="pull-right">
        <button onClick={this.editOption.bind( this, index )} className="btn btn-link">{getLabel( 'optionEdit', lang )}</button>
        <button className="btn btn-link">{getLabel( 'optionDrag', lang )}</button>
      </div> }
      { isEdited ? this.renderEdit( index, option ) : null }
    </div>

  }

  renderEdit( index, option ) {

    const { field, lang } = this.props;

    return <OptionLabelsForm
      option={option}
      otherOptions={this.props.value.filter( ( o, i ) => i !== index )}
      onSubmit={this.updateOption.bind( this, index )}
      lang={lang}
      languages={field.languages}
    />

  }

  renderAdd() {

    const { field, lang } = this.props;

    const { mode } = this.state;

    if ( mode !== modes.ADDING ) {

      return <button
        disabled={this.state.mode !== null}
        className="btn btn-primary margin-top-md"
        onClick={this.setMode.bind( this, modes.ADDING )}>{getLabel( 'optionAdd', lang )}</button>

    }

    return <div className="margin-top-md">
      <OptionLabelsForm
        otherOptions={this.props.value}
        onSubmit={this.addOption.bind( this )}
        lang={lang}
        languages={field.languages}
      />
    </div>

  }

  isOptionDisabled( index ) {

    if ( this.state.mode === modes.ADDING ) return true;

    if ( ( this.state.mode === modes.EDITING ) && ( index !== this.state.editedIndex ) ) return true;

    return false

  }

  render() {

    const { field, error, value, lang } = this.props;

    const languages = field.languages;

    const options = value || [];

    return <div>
      { options.length ? <ul className="list-group margin-v-sm">
        { options.map( ( o, i ) => <li key={o.value} className={classNames({
          'list-group-item' : true,
          disabled: this.isOptionDisabled( i )
        })}>{this.renderOption( i, o )}</li> ) }
      </ul> : <div className="margin-top-md margin-bottom-sm text-center">{getLabel( 'emptyOptions', lang )}</div> }
      {this.renderAdd()}
    </div>

  }

}
