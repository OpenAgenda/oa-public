import _ from 'lodash';
import React, { Component } from 'react';
import debug from 'debug';
import { defineMessages, FormattedMessage } from 'react-intl';
import LocationForm from './LocationForm';
import LocationSearch from './LocationSearch';
import LocationConfirmation from './LocationConfirmation';
import CreateFormHeader from './CreateFormHeader';

const log = debug('LocationSelector');

const messages = defineMessages({
  change: {
    id: 'AgendaLocations.LocationSelector.change',
    defaultMessage: 'change',
  },
  find: {
    id: 'AgendaLocations.LocationSelector.find',
    defaultMessage: 'Find',
  },
  noLocation: {
    id: 'AgendaLocations.LocationSelector.noLocation',
    defaultMessage: 'Select a location',
  },
});

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
    this.onCreateRequest = this.onCreateRequest.bind(this);
    // this.onSelect = this.onSelect.bind(this, false);
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

  switchToSearch() {
    const { onChange } = this.props;
    onChange('search');
  }

  renderConfirmation() {
    const {
      res, lang, location, tiles, settings, staticMapTiles
    } = this.props;
    return (
      <LocationConfirmation
        res={res}
        lang={lang}
        location={location}
        tiles={tiles}
        staticMapTiles={staticMapTiles}
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
            <button
              type="button"
              onClick={this.switchToSearch}
              className="btn btn-default"
            >
              {location ? <FormattedMessage {...messages.change} /> : <FormattedMessage {...messages.find} />}
            </button>
          </div>
        ) : null}
        {location ? (
          <div>
            <div className="name">{location.name}</div>
            <div className="address">{location.address}</div>
          </div>
        ) : (
          <div>
            <p className="nolocation"><FormattedMessage {...messages.noLocation} /></p>
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
    const onSelect = this.onSelect.bind(this, confirmRequired);
    return (
      <LocationSearch
        init={location ? location.name : ''}
        res={res}
        allowCreate={allowCreate}
        onCreateRequest={this.onCreateRequest}
        onSelect={onSelect}
      />
    );
  }

  renderHeader() {
    return (
      <CreateFormHeader/>
    );
  }

  renderCreateForm() {
    const {
      res, settings, lang, location, detailedInfo, enableGeocode, tiles
    } = this.props;
    const onSelect = this.onSelect.bind(this, false);
    return (
      <LocationForm
        Header={this.renderHeader()}
        res={res}
        lang={lang}
        location={location}
        detailedInfo={
          (settings.eventForm
            && settings.eventForm.detailed)
            || detailedInfo
        }
        settings={settings}
        onCancel={this.switchToSearch}
        onSuccess={onSelect}
        enableGeocode={enableGeocode}
        postRes={res.create}
        tiles={tiles}
        mode="create"
      />
    );
  }

  render() {
    const { mode } = this.props;
    log('render mode:', mode);

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
