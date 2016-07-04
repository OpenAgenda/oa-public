import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers'
import thunkMiddleware from 'redux-thunk'

export default compose(
  applyMiddleware( thunkMiddleware ),
  window.devToolsExtension()
)