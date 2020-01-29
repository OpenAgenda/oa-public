import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
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
    settings: {
      eventForm: {
        detailed: false
      }
    },
    disableChange: false,
    allowCreate: true,
    confirmRequired: false,
    detailedInfo: false
  }

  constructor(props) {
    super(props);

    this.state = {
      name: ''
    };
  }

  getLabel(name, values) {
    const label = labels[name];

    let str = _.get(label, this.props.lang, label[_.first(_.keys(label))]);
    let k;

    if (values) {
      for (k in values) {
        str = str.replace(k, values[k]);
      }
    }

    return str;
  }

  onSelect(confirmRequired, location) {
    this.props.onChange(confirmRequired ? 'confirm' : 'show', location);
  }

  onConfirm() {
    this.props.onChange('show', this.props.location);
  }

  onCreateRequest(value) {
    this.props.onChange('create', { name: value });
  }

  switchToSearch() {
    this.props.onChange('search');
  }

  renderConfirmation() {
    return <LocationConfirmation
      res={this.props.res}
      lang={this.props.lang}
      location={this.props.location}
      mapboxKey={this.props.mapboxKey}
      settings={this.props.settings}
      onConfirm={this.onConfirm.bind(this)}
      onCancel={this.switchToSearch.bind(this)}
    />
  }

  renderSelected() {
    return <div className="selected-location">
      {!this.props.disableChange ? <div className="actions">
        <a
          onClick={this.switchToSearch.bind(this)}
          className="btn btn-default">
          {this.getLabel(this.props.location ? 'change' : 'find')}
        </a>
      </div> : null}
      {this.props.location ? <div>
        <div className="name">{this.props.location.name}</div>
        <div className="address">{this.props.location.address}</div>
      </div>
      : <div>
        <p className="nolocation">{this.getLabel('nolocation')}</p>
      </div>}
    </div>
  }

  renderSearch() {
    const confirmRequired = !!_.get(this.props, 'confirmRequired');
    return <LocationSearch
      init={this.props.location ? this.props.location.name : ''}
      getLabel={this.getLabel.bind(this)}
      res={this.props.res}
      lang={this.props.lang}
      onSelect={this.onSelect.bind(this, confirmRequired)}
      allowCreate={this.props.allowCreate}
      onCreateRequest={this.onCreateRequest.bind(this)}/>
  }

  renderHeader() {
    return <CreateFormHeader
      settings={this.props.settings}
      lang={this.props.lang}
    />
  }

  renderCreateForm() {
    return <LocationForm
      Header={this.renderHeader()}
      settings={this.props.settings}
      detailedInfo={(this.props.settings.eventForm && this.props.settings.eventForm.detailed) || this.props.detailedInfo}
      res={this.props.res}
      enableGeocode={this.props.enableGeocode}
      lang={this.props.lang}
      onCancel={this.switchToSearch.bind(this)}
      onSuccess={this.onSelect.bind(this, false)}
      labels={createLabels}
      location={this.props.location} />
  }

  render() {
    const { mode } = this.props;

    const renderComponent = () => {
      if (mode === 'search') {
        return this.renderSearch();
      } else if (mode === 'create') {
        return this.renderCreateForm();
      } else if (mode === 'confirm') {
        return this.renderConfirmation();
      }
      return this.renderSelected();
    }
    return <div className="location-selector">
      {renderComponent()}
    </div>
  }
}

export default props => <LocationSelector {...props} />
