'use strict'

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createLabels from '@openagenda/labels/agenda-locations/create';
import LocationForm from './LocationForm';
import CreateFormHeader from './CreateFormHeader';


class CreateForm extends Component {
  renderHeader() {
    const {
      settings,
      actions,
      lang
    } = this.props;
    return (
      <CreateFormHeader
        settings={settings}
        actions={actions}
        lang={lang}
      />
    );
  }

  render() {
    const {
      res,
      enableGeocode,
      lang,
      actions,
      detailedInfo,
      settings
    } = this.props;
    return (
      <LocationForm
        postRes={res.create}
        Header={this.renderHeader()}
        location={null}
        enableGeocode={enableGeocode}
        labels={createLabels}
        showToggler={false}
        res={res}
        lang={lang}
        onCancel={actions.closeForm}
        onSuccess={actions.addLocation}
        detailedInfo={detailedInfo}
        settings={settings}
      />
    );
  }
}

CreateForm.propTypes = {
    lang: PropTypes.string,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object,
}

export default CreateForm;
