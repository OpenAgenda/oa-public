'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.createAggregator = createAggregator;
var CREATE_AGG = 'aggregator-sources/agenda/CREATE_AGG';
var CREATE_AGG_SUCCESS = 'aggregator-sources/agenda/CREATE_AGG_SUCCESS';
var CREATE_AGG_FAIL = 'aggregator-sources/agenda/CREATE_AGG_FAIL';

var initialState = {};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case CREATE_AGG_SUCCESS:
      return _extends({}, state, {
        isAggregator: true
      });
    default:
      return state;
  }
}

function createAggregator() {
  return {
    types: [CREATE_AGG, CREATE_AGG_SUCCESS, CREATE_AGG_FAIL],
    promise: function promise(client, _ref) {
      var res = _ref.res,
          agenda = _ref.agenda;

      console.log(res.createAggregator.replace(':uid', agenda.uid));
      return client.get(res.createAggregator.replace(':uid', agenda.uid));
    }
  };
}