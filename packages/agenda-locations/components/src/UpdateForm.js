import debug from 'debug';
import React from 'react';
import PropTypes from 'prop-types';
import formLabels from '@openagenda/labels/agenda-locations/form';
import updateLabels from '@openagenda/labels/agenda-locations/update';
import makeLabelGetter from '@openagenda/labels';

import LocationForm from './LocationForm';

const log = debug('UpdateForm');

const labels = {
  ...formLabels,
  ...updateLabels
};

const getLabel = makeLabelGetter(labels);

class UpdateForm extends React.Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    enableGeocode: PropTypes.bool.isRequired,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object,
  };

  renderHeader() {
    const { actions, lang } = this.props;
    return (
      <div className="form-head">
        <button type="button" className="btn btn-default" onClick={actions.closeForm}>
          <i className="fa fa-angle-left margin-right-sm" />
          <span>{getLabel('back', lang)}</span>
        </button>
        <h2>{getLabel('title', lang)}</h2>
        <span className="info">{getLabel('info', lang)}</span>
      </div>
    );
  }

  render() {
    const {
      res,
      actions,
      enableGeocode,
      lang,
      detailedInfo,
      settings
    } = this.props;
    const formState = actions.getState().form;

    log('rendering form for location of uid %s', formState?.location?.uid);

    return (
      <LocationForm
        Header={this.renderHeader()}
        labels={labels}
        showToggler
        res={res}
        lang={lang}
        location={formState.location}
        detailedInfo={detailedInfo}
        settings={settings}
        onCancel={actions.closeForm}
        onSuccess={actions.updateEditedLocation}
        enableGeocode={enableGeocode}
        postRes={res.update.replace(
          ':locationUid',
          formState.location.uid
        )}
      />
    );
  }
}

export default UpdateForm;
