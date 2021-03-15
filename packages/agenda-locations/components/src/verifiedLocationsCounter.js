/**
 * this little module fetches the count
 * of locations to be verfied for a specific
 * agenda. The ressource it fetches the count
 * from is given in the data-options of the anchor
 * element
 */

import React from 'react';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import debug from 'debug';
import get from '@openagenda/utils/get';

const anchor = 'js_locations_counter';
const log = debug('verifiedLocationCounter');

if (!window.oa) window.oa = {};

let anchorElem;

function _checkReqs() {
  if (!anchorElem) {
    log(
      'error',
      'no anchor element was found for verified location counter'
    );
    return false;
  }
  return true;
}

window.addEventListener('load', () => {
  log('addEventListener');
  anchorElem = document.getElementsByClassName(anchor)[0];

  if (!_checkReqs()) return;

  const params = {
    res: anchorElem.getAttribute('data-res'),
  };

  ReactDom.render(<Counter res={params.res} />, anchorElem);
});

class Counter extends React.Component {
  static propTypes= {
    res: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    window.oa.verifiedLocationsCounter = this.sync(props);
    this.state = {
      count: null,
    };
    log('construc ', props);
  }

  sync() {
    const { res } = this.props;
    log('sinc', this.props);
    get(res, (err, result) => {
      if (err) return log('error', err);

      this.setState({
        count: result.count || null,
      });
    });
  }

  render() {
    const { count } = this.state;
    if (!count) return <span />;
    return <span className="badge badge-warning">{count}</span>;
  }
}
