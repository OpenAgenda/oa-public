import _ from 'lodash';
import ih from 'immutability-helper';
import { Component } from 'react';

import { Modal, Spinner } from '@openagenda/react-shared';
import LocationSelector from '@openagenda/agenda-locations-app/dist/components/LocationSelector.js';
import Provider from '@openagenda/agenda-locations-app/dist/decorators/Providers.js';

import flattenLocationTagSet from '../utils/flattenLocationTagSet.js';

const getResItem = (res, key, suffix) => {
  if (typeof res === 'string') {
    return res + suffix;
  }
  if (res[key]) {
    return res[key];
  }
  return res.default + suffix;
};

const getResObject = (res) => ({
  ...res,
  index: getResItem(res, 'index', ''),
  get: getResItem(res, 'get', '/:locationUid'),
  geocode: getResItem(res, 'geocode', '/geocode'),
  reverseGeocode: getResItem(res, 'reverse', '/geocode/reverse'),
  insee: getResItem(res, 'insee', '/insee'),
  create: getResItem(res, 'create', ''),
  remove: getResItem(res, 'remove', '/remove'),
});

class LocationComponent extends Component {
  static defaultProps = {
    location: null,
    lang: 'en',
    legacy: {},
    field: null,
  };

  constructor(props) {
    super(props);

    const locationUid = _.get(props, 'value.uid') || _.get(props, 'field.default.uid');
    const res = getResObject(props.field.res);

    if (!locationUid) {
      this.state = {
        mode: 'search',
        res,
      };
    } else {
      this.state = {
        initing: true,
        res,
      };
      this.loadLocation(locationUid);
    }

    this.onChange = this.onChange.bind(this);
  }

  onChange(mode, location) {
    const { onChange } = this.props;

    this.setState({ mode });

    onChange(location);
  }

  getSettings() {
    const { lang, field } = this.props;

    const settings = {
      ...field?.legacy ?? {},
      ...field?.settings ?? {},
    };

    if (settings.tagSet) {
      return ih(settings, {
        tagSet: { $set: flattenLocationTagSet(settings.tagSet, lang) },
      });
    }

    return settings;
  }

  loadLocation(locationUid) {
    const { res } = this.state;

    const { onChange } = this.props;

    fetch(res.get.replace(':locationUid', locationUid))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((body) => {
        this.setState({
          initing: false,
          mode: body ? 'show' : 'search',
        });

        onChange(body);
      })
      .catch((err) => {
        console.log('could not load %s', locationUid);
        console.log(err);

        this.setState({
          initing: false,
          mode: 'search',
        });
      });
  }

  renderSelector() {
    const { lang, value, relatedValues, field } = this.props;

    const { mode, res } = this.state;

    const allowRemove = relatedValues?.attendanceMode === 2;

    const {
      default: defaultValue,
      tiles,
      detailedInfo,
      disableChange,
      allowCreate,
      confirmRequired,
    } = field;

    return (
      <Provider lang={lang}>
        <LocationSelector
          allowCreate={allowCreate}
          confirmRequired={confirmRequired}
          tiles={tiles}
          mode={mode}
          disableChange={disableChange}
          detailedInfo={detailedInfo}
          classNames={{
            input: '',
          }}
          allowRemove={allowRemove}
          onRemove={() => this.onChange('search', null)}
          location={_.assign({}, defaultValue || {}, value)}
          lang={lang}
          settings={this.getSettings()}
          res={res}
          onChange={this.onChange}
          placeholder={field.placeholder}
        />
      </Provider>
    );
  }

  render() {
    const { field } = this.props;

    const { initing, mode } = this.state;

    const spinnerCanvasStyle = {
      height: 37,
      position: 'relative',
    };

    if (initing) {
      return (
        <div className="margin-v-sm text-center" style={spinnerCanvasStyle}>
          <Spinner mode="inline" />
        </div>
      );
    }

    if (['create', 'confirm'].includes(mode)) {
      return (
        <div>
          <div className="text-center" style={spinnerCanvasStyle}>
            <Spinner mode="inline" />
          </div>
          <Modal classNames={{ overlay: 'popup-overlay big' }}>
            {this.renderSelector()}
          </Modal>
        </div>
      );
    }

    return (
      <div>
        <div className={mode === 'show' ? 'padding-v-sm padding-h-xs' : ''}>
          {this.renderSelector()}
        </div>
        {!field.disableChange && field.sub ? (
          <div className="sub">{field.sub}</div>
        ) : null}
      </div>
    );
  }
}

export default LocationComponent;
