import React from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import { Spinner } from '@openagenda/react-components';
import SearchField from './List/SearchField';
import List from './List/List';

const log = debug('LocationSearch');

const messages = defineMessages({
  create: {
    id: 'AgendaLocations.LocationSearch.create',
    defaultMessage: 'Create a new location',
  },
  noResult: {
    id: 'AgendaLocations.LocationSearch.noResult',
    defaultMessage: 'No result match your entry',
  },
  namePlaceholder: {
    id: 'AgendaLocations.LocationSearch.namePlaceholder',
    defaultMessage: 'Type the name of the location of the event',
  },
  searching: {
    id: 'AgendaLocations.LocationSearch.searching',
    defaultMessage: 'Searching...',
  },
});

class LocationSearch extends React.Component {
  static propTypes = {
    init: PropTypes.string.isRequired,
    allowCreate: PropTypes.bool.isRequired,
    onCreateRequest: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    const {
      init
    } = this.props;
    this.state = {
      query: init ? { search: init } : {},
      showDropdown: false,
      loading: false,
      page: 1,
      total: null,
      locations: [],
      searchFieldError: false,
      closePreempted: false,
    };
    // Binding
    this.renderEmpty = this.renderEmpty.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderCreateItem = this.renderCreateItem.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.triggerClose = this.triggerClose.bind(this);
    this.preemptClose = this.preemptClose.bind(this);
    this.onListLoaded = this.onListLoaded.bind(this);
    this.onListLoading = this.onListLoading.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  /**
   * click outside the component means the dropdown
   * should close
   */
  componentDidMount() {
    const bodyElem = document.getElementsByTagName('body')[0];

    this['location-search'].addEventListener('click', this.preemptClose);

    bodyElem.addEventListener('click', this.triggerClose);
  }

  componentWillUnmount() {
    const bodyElem = document.getElementsByTagName('body')[0];

    this['location-search'].removeEventListener('click', this.preemptClose);

    bodyElem.removeEventListener('click', this.triggerClose);
  }

  onSearchChange(value) {
    this.setState({
      query: { search: value },
    });
  }

  onFocus(value) {
    this.setState({
      query: { search: value },
      showDropdown: true,
    });
  }

  onBlur(value) {
    log('Blur', value);
    this.setState({
      searchFieldError: true
    });
  }

  onListLoading() {
    this.setState({
      loading: true,
      showDropdown: false,
    });
  }

  onListLoaded() {
    this.setState({
      loading: false,
      showDropdown: true,
    });
  }

  triggerClose(e) {
    const { closePreempted } = this.state;
    e.preventDefault();
    if (!closePreempted) {
      this.setState({ showDropdown: false });
    }
    this.setState({ closePreempted: false });
  }

  preemptClose() {
    this.setState({ closePreempted: true });
  }

  renderItem(l) {
    const { onSelect } = this.props;
    return (
      <li
        onClick={onSelect.bind(null, l)}
        className="search-item"
        key={l.uid}
      >
        <div className="name">{l.name}</div>
        <div className="address">{l.address}</div>
      </li>
    );
  }

  renderCreateItem() {
    const {
      query,
      locations
    } = this.state;

    const {
      onCreateRequest
    } = this.props;

    if (locations.length === 0) {
      return (
        <li
          className="no-search-button"
        >
          <button
            onClick={onCreateRequest.bind(null, query.search)}
            type="button"
            className="btn btn-primary"
          >
            <FormattedMessage {...messages.create} />
          </button>
        </li>
      );
    }

    return (
      <li
        className="search-item"
        onClick={onCreateRequest.bind(null, query.search)}
      >
        <a><FormattedMessage {...messages.create} /></a>
      </li>
    );
  }

  renderEmpty() {
    return (
      <li className="no-search-result"><FormattedMessage {...messages.noResult} /></li>
    );
  }

  render() {
    const {
      loading,
      query,
      showDropdown,
      locations,
      page,
      total,
      searchFieldError,
    } = this.state;

    const {
      res,
      allowCreate,
      intl
    } = this.props;

    return (
      <div
        ref={r => (this['location-search'] = r)}
        className={showDropdown ? 'dropdown open' : 'dropdown'}
      >
        <SearchField
          name="name"
          loading={loading}
          value={query.search}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          placeholder={intl.formatMessage(messages.namePlaceholder)}
          onChange={this.onSearchChange}
          error={searchFieldError}
        />
        {loading ? (
          <Spinner
            mode="inline"
            loading
            message={intl.formatMessage(messages.searching)}
          />
        ) : null}
        <List
          items={locations}
          page={page}
          total={total}
          onItemsUpdate={(locations, total, page) => {
            this.setState({ locations, total, page });
          }}
          limit={10}
          dropdownMode
          res={res.index}
          query={query}
          renderItem={this.renderItem}
          renderHead={this.renderHead}
          renderEmpty={this.renderEmpty}
          renderBottom={
            allowCreate ? this.renderCreateItem : () => {}
          }
          onLoaded={this.onListLoaded}
          onLoading={this.onListLoading}
        />
      </div>
    );
  }
}

export default injectIntl(LocationSearch);
