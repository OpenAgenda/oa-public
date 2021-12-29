import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AgendaItem from './AgendaItem';
import { Spinner } from '@openagenda/react-shared';
import List from './List';
import get from '@openagenda/utils/get';
import labels from '@openagenda/labels/agenda-search';
import makeLabelGetter from '@openagenda/labels';
import documentLocation from '@openagenda/dom-utils/documentLocation';
import actions from './actions';
import monitorField from './monitorField';
import validateQuery from '../../validators/query';

const getLabel = makeLabelGetter(labels);

class Body extends Component {
  constructor(props) {
    super(props);

    let query = {};

    try {
      query = validateQuery(this.props.query);
    } catch (e) {
      console.error('query is not valid: %s', this.props.query);
    }

    this.state = {
      total: props.total,
      agendas: props.agendas,
      pageRange: [props.page, props.page],
      query
    };
  }

  componentDidMount() {
    monitorField('.js_agenda_search', search => this.resetPage({ search }));
    if (this.props.loadOnMount) {
      this.resetPage();
    }
  }

  prepareGetQuery(query, page) {
    return {
      page,
      ...query
    }
  }

  getPage(next) {
    if (this.state.loading) return;

    const  page = this.state.pageRange[next ? 1 : 0] + (next ? +1 : -1);

    if (this.state.agendas.length >= this.state.total) return;

    this.setState({ loading: true });

    get(this.props.res, this.getHrefQuery({
      preventCache: Math.random(),
      page,
      ...this.state.query
    }), (err, data) => {
      if (err) {
        this.setState({ loading: false });
        return console.log('error', err);
      }

      const change = actions.addPageItems(this.state, next, data);

      change.loading = false;

      this.setState(change);

      documentLocation.setQueryPart(this.getHrefQuery({ page, ...this.state.query }));
    });
  }

  onSearchChange(name, search) {
    this.resetPage({ search });
  }

  resetPage(newQuery = {}) {
    this.setState({ loading: true });

    get(this.props.res, this.getHrefQuery({ page: 1, ...newQuery }), (err, data) => {
      if (err) {
        return console.log('error', err);
      }

      this.setState(actions.resetPageItems(this.state, newQuery, data));

      documentLocation.setQueryPart(this.getHrefQuery({ page: 1, ...newQuery }));
    });
  }

  getHrefQuery(query) {
    const filtered = {};

    Object.keys(query).forEach(k => {
      if (query[k] === null) return;

      if (typeof query[k] === 'string' && !query[k].length) return;

      filtered[k] = query[k];
    });

    return filtered;
  }

  renderDefaultHead() {
    return <div className="header">
      <h1>{getLabel('latestUpdated', this.props.lang)}</h1>
    </div>
  }

  renderNetworkHead() {
    return <div className="header">
      <h1>{this.props.network.title}</h1>
    </div>
  }

  renderLocationSetHead() {
    return <div className="header">
      <h1>{this.props.locationSet.title}</h1>
    </div>
  }

  renderSearchHead() {
    return <div className="header">
      <h1>{getLabel('results', { search: this.state.query.search }, this.props.lang)}</h1>
      <span>{getLabel('found', { count: this.state.total }, this.props.lang)}</span>
    </div>
  }

  renderHead() {
    if (this.state.query.search) {
      return this.renderSearchHead();
    } else if (this.props.network) {
      return this.renderNetworkHead();
    } else if (this.props.locationSet) {
      return this.renderLocationSetHead();
    } else {
      return this.renderDefaultHead();
    }
  }

  render() {
    return <div className="container agenda-search top-margined">
      <div className="row">
        <div className="wsq col-sm-8 col-sm-offset-2">
          { this.state.loading ? <Spinner/> : null }
          { this.renderHead() }
          <div className="body media-list">
            {this.state.agendas.length ? <List
              query={this.state.query}
              pageRange={this.state.pageRange}
              getPage={this.getPage.bind(this)}
              total={this.state.total}
              prevLabel={getLabel('loadPrevious', this.props.lang)}
              nextLabel={getLabel('loadNext', this.props.lang)}
              items={this.state.agendas} // a 'get' can maybe be given in props differently here from server?
              renderItem={ i => <AgendaItem agenda={i} key={i.uid} lang={this.props.lang}/> }
            /> : <div className="empty"><p>{getLabel('empty', this.props.lang) }</p></div> }
          </div>
        </div>
      </div>
    </div>
  }

};

Body.propTypes = {
  res: PropTypes.string,
  agendas: PropTypes.array,
  page: PropTypes.number,
  lang: PropTypes.string,
  query: PropTypes.object,
  loadOnMount: PropTypes.bool
};

Body.defaultProps = {
  res: '/',
  agendas: [],
  page: 1,
  lang: 'fr',
  query: null,
  loadOnMount: false
};

module.exports = Body;
