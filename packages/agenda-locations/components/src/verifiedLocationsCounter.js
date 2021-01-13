/**
 * this little module fetches the count
 * of locations to be verfied for a specific
 * agenda. The ressource it fetches the count
 * from is given in the data-options of the anchor
 * element
 */

import React from 'react';
import ReactDom from 'react-dom';
import debug from 'debug';
import get from '@openagenda/utils/get';

const anchor = 'js_locations_counter';

if (!window.oa) window.oa = {};

let anchorElem;

function _checkReqs() {
  if (!anchorElem) {
    debug(
      'error',
      'no anchor element was found for verified location counter'
    );
    return false;
  }
  return true;
}

window.addEventListener('load', () => {
  anchorElem = document.getElementsByClassName(anchor)[0];

  if (!_checkReqs()) return;

  const params = {
    res: anchorElem.getAttribute('data-res'),
  };

  ReactDom.render(<Counter res={params.res} />, anchorElem);
});

class Counter extends React.Component {
  getInitialState() {
    window.oa.verifiedLocationsCounter = this.sync;

    return {
      count: null,
    };
  }

  UNSAFE_componentWillMount() {
    this.sync();
  }

  sync() {
    const { res } = this.props;
    get(res, (err, result) => {
      if (err) return debug('error', err);

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
