/**
 * this little module fetches the count
 * of locations to be verfied for a specific
 * agenda. The ressource it fetches the count
 * from is given in the data-options of the anchor
 * element
 */

"use strict";

var _ = {
  extend: require('lodash/extend')
};
var createReactClass = require('create-react-class');
var React = require('react');
var ReactDom = require('react-dom');

var get = require('@openagenda/utils/get');

var anchor = 'js_locations_counter';

if (!window.oa) window.oa = {};

var anchorElem = void 0,
    defaults = {
  res: '#restocounterresource'
},
    Counter = void 0;

window.addEventListener('load', function () {

  anchorElem = document.getElementsByClassName(anchor)[0];

  if (!_checkReqs()) return;

  var params = _.extend(defaults, JSON.parse(anchorElem.getAttribute('data-options')));

  ReactDom.render(React.createElement(Counter, { res: params.res }), anchorElem);
});

Counter = createReactClass({
  displayName: 'Counter',
  getInitialState: function getInitialState() {

    window.oa.verifiedLocationsCounter = this.sync;

    return {
      count: null
    };
  },
  componentWillMount: function componentWillMount() {

    this.sync();
  },
  sync: function sync() {
    var _this = this;

    get(this.props.res, function (err, result) {

      if (err) return console.log('error', err);

      _this.setState({
        count: result.count || null
      });
    });
  },
  render: function render() {

    if (!this.state.count) return React.createElement('span', null);

    return React.createElement(
      'span',
      { className: 'badge badge-warning' },
      this.state.count
    );
  }
});

function _checkReqs() {

  if (!anchorElem) {

    console.log('error', 'no anchor element was found for verified location counter');

    return false;
  }

  if (!anchorElem.getAttribute('data-options')) {

    console.log('verified location counter options are missing');

    return false;
  }

  return true;
}
//# sourceMappingURL=verifiedLocationsCounter.js.map