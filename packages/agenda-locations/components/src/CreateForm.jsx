"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import utils from '@openagenda/utils';
import createLabels from '@openagenda/labels/agenda-locations/create';
import formLabels from '@openagenda/labels/agenda-locations/form';
import makeLabelGetter from '@openagenda/labels';
import LocationForm from './LocationForm';
import CreateFormHeader from './CreateFormHeader';

var getLabel = makeLabelGetter( utils.extend( {}, formLabels, createLabels ) );

module.exports = createReactClass( {

  propTypes: {
    lang: PropTypes.string,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object
  },

  renderHeader() {

    return <CreateFormHeader
      settings={ this.props.settings }
      actions={ this.props.actions }
      lang={ this.props.lang }
    />

  },

  render() {

    return <LocationForm
      Header={ this.renderHeader() }
      location={ null }
      enableGeocode={this.props.enableGeocode}
      labels={ createLabels }
      showToggler={ false }
      res={ this.props.res }
      lang={ this.props.lang }
      onCancel={ this.props.actions.closeForm }
      onSuccess={ this.props.actions.addLocation }
      detailedInfo={ this.props.detailedInfo }
      settings={ this.props.settings }
    />

  }

} );
