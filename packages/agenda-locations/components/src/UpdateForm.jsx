"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import utils from '@openagenda/utils';
import formLabels from '@openagenda/labels/agenda-locations/form';
import updateLabels from '@openagenda/labels/agenda-locations/update';
import makeLabelGetter from '@openagenda/labels';
import LocationForm from './LocationForm';

var getLabel = makeLabelGetter( utils.extend( {}, formLabels, updateLabels ) );

module.exports = createReactClass( {

  propTypes: {
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object
  },

  renderHeader( location ) {


    return <div className="form-head">
      <a onClick={ this.props.actions.closeForm }>{ getLabel( 'back', this.props.lang ) }</a>
      <h2>{ getLabel( 'title', this.props.lang ) }</h2>
      <span className="info">{ getLabel( 'info', this.props.lang ) }</span>
    </div>

  },

  render() {

    let formState = this.props.actions.getState().form;

    return <LocationForm
      Header={this.renderHeader( formState.location ) }
      location={ formState.location }
      labels={ updateLabels }
      showToggler={ true }
      res={ this.props.res }
      lang={ this.props.lang }
      onCancel={ this.props.actions.closeForm }
      onSuccess={ this.props.actions.updateEditedLocation }
      detailedInfo={ this.props.detailedInfo }
      settings={ this.props.settings }
    />

  }

} );