import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import labels from '@openagenda/labels/agenda-locations/selector';
import createLabels from '@openagenda/labels/agenda-locations/create';
import LocationForm from './LocationForm';
import LocationSearch from './LocationSearch';
import LocationConfirmation from './LocationConfirmation';
import CreateFormHeader from './CreateFormHeader';

class LocationSelector extends Component {
  static defaultProps = {
    mode: 'create',
    enableGeocode: true,
    disableChange: false,
    allowCreate: true,
    confirmRequired: false,
    detailedInfo: false,
    settings: {
      eventForm: {
        detailed: false,
      },
    },
  };

  constructor(props) {
    super(props);

    // Binding
    this.onConfirm = this.onConfirm.bind(this);
    this.switchToSearch = this.switchToSearch.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.onCreateRequest = this.onCreateRequest.bind(this);
    this.onSelect = this.onSelect.bind(this, false);
  }

  onSelect(confirmRequired, location) {
    const { onChange } = this.props;
    onChange(confirmRequired ? 'confirm' : 'show', location);
  }

  onConfirm() {
    const { onChange, location } = this.props;
    onChange('show', location);
  }

  onCreateRequest(value) {
    const { onChange } = this.props;
    onChange('create', { name: value });
  }

  getLabel(name, values) {
    const { lang } = this.props;
    const label = labels[name];

    let str = _.get(label, lang, label[_.first(_.keys(label))]);
    let k;

    if (values) {
      for (k in values) {
        if (Object.prototype.hasOwnProperty.call(values, k)) {
          str = str.replace(k, values[k]);
        }
      }
    }

    return str;
  }

  switchToSearch() {
    const { onChange } = this.props;
    onChange('search');
  }

  renderConfirmation() {
    const {
      res, lang, location, mapboxKey, settings
    } = this.props;
    return (
      <LocationConfirmation
        res={res}
        lang={lang}
        location={location}
        mapboxKey={mapboxKey}
        settings={settings}
        onConfirm={this.onConfirm}
        onCancel={this.switchToSearch}
      />
    );
  }

  renderSelected() {
    const { location, disableChange } = this.props;
    return (
      <div className="selected-location">
        {!disableChange ? (
          <div className="actions">
            <a
              onClick={this.switchToSearch}
              className="btn btn-default"
            >
              {this.getLabel(location ? 'change' : 'find')}
            </a>
          </div>
        ) : null}
        {location ? (
          <div>
            <div className="name">{location.name}</div>
            <div className="address">{location.address}</div>
          </div>
        ) : (
          <div>
            <p className="nolocation">{this.getLabel('nolocation')}</p>
          </div>
        )}
      </div>
    );
  }

  renderSearch() {
    const {
      location, res, lang, allowCreate
    } = this.props;
    const confirmRequired = !!_.get(this.props, 'confirmRequired');
    return (
      <LocationSearch
        init={location ? location.name : ''}
        lang={lang}
        res={res}
        allowCreate={allowCreate}
        getLabel={this.getLabel}
        onCreateRequest={this.onCreateRequest}
        onSelect={this.onSelect.bind(this, confirmRequired)}
      />
    );
  }

  renderHeader() {
    const { settings, lang } = this.props;
    return (
      <CreateFormHeader settings={settings} lang={lang} />
    );
  }

  renderCreateForm() {
    const {
      res, settings, lang, location, detailedInfo, enableGeocode
    } = this.props;
    return (
      <LocationForm
        postRes={res.create}
        Header={this.renderHeader()}
        settings={settings}
        detailedInfo={
          (settings.eventForm
            && settings.eventForm.detailed)
            || detailedInfo
        }
        res={res}
        enableGeocode={enableGeocode}
        lang={lang}
        onCancel={this.switchToSearch}
        onSuccess={this.onSelect}
        labels={createLabels}
        location={location}
      />
    );
  }

  render() {
    const { mode } = this.props;

    const renderComponent = () => {
      if (mode === 'search') {
        return this.renderSearch();
      } if (mode === 'create') {
        return this.renderCreateForm();
      } if (mode === 'confirm') {
        return this.renderConfirmation();
      }
      return this.renderSelected();
    };
    return <div className="location-selector">{renderComponent()}</div>;
  }
}

export default props => <LocationSelector {...props} />;
