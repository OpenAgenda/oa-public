import React from 'react';
import PropTypes from 'prop-types';
import get from '@openagenda/utils/get';
import _ from 'lodash';
import utils from '@openagenda/utils';
import update from 'immutability-helper';
import monitorBottomHit from './lib/monitorBottomHit';
import debug from 'debug';

const log = debug('List');

class List extends React.Component {
  static defaultProps = {
    dropdownMode: false,
    limit: 40,
    items: [],
    total: null,
    page: 1
  };

  static propTypes = {
    items: PropTypes.array,
    total: PropTypes.number,
    page: PropTypes.number,
    dropdownMode: PropTypes.bool,
    onLoading: PropTypes.func,
    onLoaded: PropTypes.func,
    limit: PropTypes.number,
    renderHead: PropTypes.func,
    renderItem: PropTypes.func.isRequired,
    renderEmpty: PropTypes.func,
    renderNav: PropTypes.func,
    renderBottom: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loadingNext: false,
      loadError: false,
      dropped: false,
      buffer: null
    };
    log('construct props;',props);
    this.getPage = this.getPage.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.getAdjacentPage = this.getAdjacentPage.bind(this);
  }

  componentDidMount() {
    log('ccomponent did Mount props;',this.props);
    const { dropdownMode, query, items } = this.props;
    if (dropdownMode && !utils.size(query)) return;
    if (items.length) {
      return monitorBottomHit(this.getAdjacentPage);
    }

    this.getPage(1, true, () => {
      if (dropdownMode) return;
      monitorBottomHit(this.getAdjacentPage);
    });
  }

  /**
   * load anew if query changed
   */

  componentDidUpdate(prevProps, prevState) {
    const { query } = this.props;
    if (JSON.stringify(prevProps.query) === JSON.stringify(query)) return;
    this.bufferize();
  }

  componentWillUnmount() {
    monitorBottomHit.unregister();
  }

  getAdjacentPage(prev, replace) {
    const { page } = this.props;
    const { loadingNext } = this.state;
    const newPage = page + (prev ? -1 : 1);
    if (loadingNext) return;
    this.getPage(newPage, replace);
  }

  getPage(page, replace, cb) {
    const {
      query, onLoading, res, limit, items, onItemsUpdate, onLoaded, page: propPage
    } = this.props;
    log('getting page %s with query %s', page, JSON.stringify(query));
    this.setState({
      loading: page === 1,
      loadingNext: page !== 1
    });
    if (page === 1 && onLoading) {
      onLoading();
    }
    get(res, _.merge({
      offset: (page - 1) * limit,
      limit
    }, query), (err, result) => {
      const newState = {
        loading: false,
        loadingNext: false,
        page: err ? propPage : page,
        loadError: !!err,
      };
      log('received page %s', page);
      if (!err) {
        newState.hasNext = result.total > page * limit;
        newState.hasPrev = page > 1;
      }
      this.setState(newState);
      onItemsUpdate(
        replace ? result.items : update(items, { $push: result.items }),
        result.total,
        page
      );
      if (!err && page === 1 && onLoaded) {
        onLoaded(result.total);
      }
      if (cb) cb(err, result);
    });
  }

  bufferize() {
    const { buffer } = this.state;
    if (buffer) clearTimeout(buffer);
    this.setState({
      buffer: setTimeout(() => {
        this.getPage(1, true, monitorBottomHit.assess);
      }, 500)
    });
  }

  // remove this and do it where it is needed.
  removeItem(itemIndex) {
    const { items, onItemsUpdate } = this.props;
    const updated = items.concat();
    updated.splice(itemIndex, 1);
    onItemsUpdate(updated);
  }

  renderItem(item, i) {
    const { renderItem: propsRenderItem } = this.props;
    return propsRenderItem(item, {
      remove: this.removeItem.bind(null, i)
    }, i);
  }

  renderNav(type) {
    // need some notion of where we stand...
    const { hasNext, hasPrev } = this.state;
    if (type === 'next' ? hasNext : hasPrev) {
      return <li className="nav-item" onClick={this.getAdjacentPage.bind( null, type === 'prev', true )}><i className="fa fa-ellipsis-h"></i></li>;
    }
    return '';
  }

  renderEmpty() {
    const { items, renderEmpty } = this.props;
    if (items.length || !renderEmpty) return '';
    return renderEmpty();
  }

  renderBottom() {
    const { hasNext } = this.state;
    const { renderBottom } = this.props;
    if (hasNext || !renderBottom) return '';
    return renderBottom();
  }

  render() {
    const { dropdownMode, items, renderHead } = this.props;
    if (dropdownMode) {
      return (
        <ul className="dropdown-menu">
          {this.renderNav('prev')}
          {items.map(this.renderItem)}
          {this.renderNav('next')}
          {this.renderEmpty()}
          {this.renderBottom()}
        </ul>
      );
    }
    return (
      <div>
        {renderHead ? <div>{renderHead()}</div> : ''}
        <div>{items.map(this.renderItem)}{this.renderEmpty()}</div>
      </div>
    );
  }
}

export default List;
