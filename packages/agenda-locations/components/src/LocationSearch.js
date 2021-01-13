import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@openagenda/react-components';
import SearchField from './List/SearchField';
import List from './List/List';

class LocationSearch extends React.Component {
  static propTypes = {
    init: PropTypes.string.isRequired,
    allowCreate: PropTypes.bool.isRequired,
    getLabel: PropTypes.func.isRequired,
    onCreateRequest: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
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
    };
    // Binding
    this.renderEmpty = this.renderEmpty.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderCreateItem = this.renderCreateItem.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.triggerClose = this.triggerClose.bind(this);
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

    bodyElem.removeEventListener('click', this.triggerClose);

    this['location-search'].removeEventListener('click', this.preemptClose);
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

  onListLoading() {
    this.setState({
      loading: true,
      showDropdown: false,
    });
  }

  onListLoaded(total) {
    this.setState({
      loading: false,
      showDropdown: true,
    });
  }

  triggerClose() {
    if (!this.closePreempted) {
      this.setState({ showDropdown: false });
    }

    this.closePreempted = false;
  }

  preemptClose() {
    this.closePreempted = true;
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
      query
    } = this.state;

    const {
      getLabel,
      onCreateRequest
    } = this.props;

    return (
      <li
        className="search-item"
        onClick={onCreateRequest.bind(null, query.search)}
      >
        <a>{getLabel('create')}</a>
      </li>
    );
  }

  renderEmpty() {
    const {
      getLabel
    } = this.props;
    return (
      <li className="no-search-result">{getLabel('noresult')}</li>
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
    } = this.state;

    const {
      getLabel,
      res,
      allowCreate
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
          placeholder={getLabel('namePlaceholder')}
          onChange={this.onSearchChange}
        />
        {loading ? (
          <Spinner
            mode="inline"
            loading
            message={getLabel('searching')}
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

export default LocationSearch;
