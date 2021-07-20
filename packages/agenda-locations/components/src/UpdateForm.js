import debug from 'debug';
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

import LocationForm from './LocationForm';

const log = debug('UpdateForm');

const messages = defineMessages({
  back: {
    id: 'AgendaLocations.UpdateForm.back',
    defaultMessage: 'Go back to the list',
  },
  title: {
    id: 'AgendaLocations.UpdateForm.title',
    defaultMessage: 'Location edit',
  },
  info: {
    id: 'AgendaLocations.UpdateForm.info',
    defaultMessage: 'All events attached to this location will be updated',
  },
});

class UpdateForm extends React.Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    enableGeocode: PropTypes.bool.isRequired,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object,
    tiles: PropTypes.string
  };

  renderHeader() {
    const { actions } = this.props;
    return (
      <div className="form-head">
        <button type="button" className="btn btn-default" onClick={actions.closeForm}>
          <i className="fa fa-angle-left margin-right-sm" />
          <span><FormattedMessage {...messages.back} /></span>
        </button>
        <h2><FormattedMessage {...messages.title} /></h2>
        <span className="info"><FormattedMessage {...messages.info} /></span>
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
      settings,
      tiles
    } = this.props;
    const formState = actions.getState().form;

    log('rendering form for location of uid %s', formState?.location?.uid);

    return (
      <LocationForm
        Header={this.renderHeader()}
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
        tiles={tiles}
        mode="update"
      />
    );
  }
}

export default UpdateForm;
