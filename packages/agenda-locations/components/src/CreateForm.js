<<<<<<< HEAD
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import formLabels from '@openagenda/labels/agenda-locations/form';
=======
'use strict'

import React, { Component } from 'react';
import PropTypes from 'prop-types';
>>>>>>> refactor(agenda-locations): component creation method update
import createLabels from '@openagenda/labels/agenda-locations/create';
import LocationForm from './LocationForm';
import CreateFormHeader from './CreateFormHeader';

<<<<<<< HEAD
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

=======

class CreateForm extends Component {
>>>>>>> refactor(agenda-locations): component creation method update
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
<<<<<<< HEAD
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
=======
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
>>>>>>> refactor(agenda-locations): component creation method update
      />
    );
  }
}

<<<<<<< HEAD
=======
CreateForm.propTypes = {
    lang: PropTypes.string,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object,
}

>>>>>>> refactor(agenda-locations): component creation method update
export default CreateForm;
