import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import debug from 'debug';
import mergeLabels from '@openagenda/labels/agenda-locations/merge';
import formLabels from '@openagenda/labels/agenda-locations/form';
import makeLabelGetter from '@openagenda/labels';
import LocationForm from './LocationForm';

const log = debug('MergeForm');

const getLabel = makeLabelGetter({
  ...formLabels,
  ...mergeLabels
});

class MergeForm extends React.Component {
  static propTypes = {
    lang: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    res: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    // Binding
    this.onSuccess = this.onSuccess.bind(this);
    this.getSetRes = this.getSetRes.bind(this);
  }

  onSuccess(location, complete) {
    const { actions } = this.props;
    if (!complete) {
      actions.updateEditedLocation(location);
    } else {
      actions.closeMerge();
    }
  }

  getSetRes() {
    const { actions, res } = this.props;
    const formState = actions.getState().form;

    return `${res.merge}?${
      qs.stringify({
        mergeIn: formState.location.uid,
        merged: formState.alternatives.map(s => s.location.uid)
      })
    }`;
  }

  renderHeader() {
    const { actions, lang } = this.props;
    return (
      <div className="form-head">
        <button type="button" className="btn btn-default" onClick={actions.closeForm}>
          <i className="fa fa-angle-left margin-right-sm" />
          <span>{getLabel('back', lang)}</span>
        </button>
        <h2>{ getLabel('title') }</h2>
        <span className="info">{ getLabel('info') }</span>
      </div>
    );
  }

  render() {
    const {
      actions, res, lang, detailedInfo, settings
    } = this.props;
    const formState = actions.getState().form;

    log('displaying merge form for %s locations', formState.alternatives.length);

    return (
      <LocationForm
        Header={this.renderHeader()}
        labels={mergeLabels}
        showToggler
        res={res}
        lang={lang}
        location={formState.location}
        detailedInfo={detailedInfo}
        settings={settings}
        onCancel={actions.closeForm}
        onSuccess={this.onSuccess}
        getSetRes={this.getSetRes}
        hideCurrentAlternative
        alternatives={formState.alternatives}
      />
    );
  }
}

export default MergeForm;
