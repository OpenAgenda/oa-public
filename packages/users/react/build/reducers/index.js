'use strict';

var _require = require('redux'),
    combineReducers = _require.combineReducers,
    _require2 = require('react-router-redux'),
    routerReducer = _require2.routerReducer,
    _require3 = require('redux-form'),
    form = _require3.reducer,
    app = require('./app'),
    userSettings = require('./userSettings');

module.exports = combineReducers({
  routing: routerReducer,
  form: form,
  app: app,
  userSettings: userSettings
});
//# sourceMappingURL=index.js.map