import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LocationForm from './LocationForm';
import CreateFormHeader from './CreateFormHeader';

class CreateForm extends Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    enableGeocode: PropTypes.bool.isRequired,
    actions: PropTypes.object,
    res: PropTypes.object,
    settings: PropTypes.object,
    tiles: PropTypes.string
  }

  renderHeader() {
    const {
      actions,
    } = this.props;
    return (
      <CreateFormHeader
        actions={actions}
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
      settings,
      tiles
    } = this.props;

    return (
      <LocationForm
        Header={this.renderHeader()}
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
        tiles={tiles}
        mode="create"
      />
    );
  }
}

export default CreateForm;
