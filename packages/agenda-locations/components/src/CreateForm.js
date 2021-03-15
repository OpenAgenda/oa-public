import React, { Component } from 'react';
import PropTypes from 'prop-types';
import formLabels from '@openagenda/labels/agenda-locations/form';
import createLabels from '@openagenda/labels/agenda-locations/create';
import LocationForm from './LocationForm';
import CreateFormHeader from './CreateFormHeader';

const labels = {
  ...formLabels,
  ...createLabels
};

class CreateForm extends Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    enableGeocode: PropTypes.bool.isRequired,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object,
  }
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
        Header={this.renderHeader()}
        labels={labels}
        showToggler={false}
        res={res}
        lang={lang}
        location={null}
        detailedInfo={detailedInfo}
        settings={settings}
        onCancel={actions.closeForm}
        onSuccess={actions.addLocation}
        enableGeocode={enableGeocode}
        postRes={res.create}
      />
    );
  }
}

export default CreateForm;
